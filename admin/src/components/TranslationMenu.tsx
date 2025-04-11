import {
  Box,
  Button,
  DatePicker,
  Typography,
  Radio,
  Checkbox,
  Alert,
  Flex,
} from '@strapi/design-system';
import { useState, useEffect } from 'react';
import {
  unstable_useContentManagerContext as useContentManagerContext,
  getFetchClient,
} from '@strapi/strapi/admin';
import {
  MappingsResponse,
  TranslationRequest,
  TranslationRequestTranslations,
} from '../../../Types';
// @ts-ignore
import logoSvg from '../assets/translationstudio-white.svg';

const TranslationMenu = () => {
  const [languages, setLanguages] = useState<MappingsResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [source, setSource] = useState('');
  const [email, setEmail] = useState('');
  const [isEmail, setIsEmail] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [dueDate, setDueDate] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const { get, post } = getFetchClient();
  const context = useContentManagerContext();
  const { id, contentType, model } = context || {};
  const isCollectionType = contentType?.kind === 'collectionType';

  const selectedLang = Array.isArray(languages)
    ? languages.find((lang) => lang.name === selectedOption)
    : undefined;
  const isMachineTranslation = selectedLang?.machine ?? false;

  async function fetchEmail() {
    const response = await get('/translationstudio/email');
    setEmail(response.data.email ?? '');
  }

  useEffect(() => {
    fetchEmail();
  }, []);

  useEffect(() => {
    if (!model || (!id && isCollectionType)) return;

    const fetchLanguages = async () => {
      try {
        const response = await get('/translationstudio/mappings');
        setLanguages(response.data);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, [id, model, isCollectionType]);

  const handleUrgentChange = () => {
    if (isUrgent) {
      setIsUrgent(false);
      setDueDate(0);
    } else {
      setIsUrgent(true);
    }
  };

  const handleEmailChange = () => {
    email ? setIsEmail(false) : setIsEmail(true);
    fetchEmail();
  };

  const handleDueDateChange = (date: Date) => {
    const timestamp = date.getTime();
    setDueDate(timestamp < Date.now() ? 0 : timestamp);
    setIsUrgent(false);
  };

  const handleRadioSelection = (value: string) => {
    setSelectedOption(value);
    const lang = languages.find((l) => l.name === value);
    if (lang) {
      setSource(lang.source);
      if (lang.machine) {
        setIsUrgent(false);
        setDueDate(0);
      }
    }
  };

  const displayAlert = (variant: 'success' | 'danger', message: string) => {
    setAlertType(variant);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const determineEntryName = (fetchedEntryData: any) => {
    if (!fetchedEntryData) return 'Untitled';

    // Try common title fields
    const commonTitleFields = ['title', 'name', 'headline'];
    for (const field of commonTitleFields) {
      const key = Object.keys(fetchedEntryData).find((k) => k.toLowerCase() === field);
      if (key && typeof fetchedEntryData[key] === 'string' && fetchedEntryData[key].trim()) {
        return fetchedEntryData[key];
      }
    }

    // Find first non-empty string field
    const excludedFields = [
      'id',
      'createdAt',
      'updatedAt',
      'publishedAt',
      'locale',
      'createdBy',
      'updatedBy',
      'documentId',
      'provider',
      'resetPasswordToken',
      'confirmationToken',
      'password',
      'email',
      'slug',
      'link',
      'url',
      'image',
      'file',
      'media',
    ];

    for (const [key, value] of Object.entries(fetchedEntryData)) {
      if (!excludedFields.includes(key) && typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    return `${contentType?.info?.displayName ?? ''} #${id ?? ''}`;
  };

  const handleTranslationRequest = async () => {
    const entryUid = isCollectionType ? `${model}#${id}` : model;

    try {
      const entryResponse = await post('/translationstudio/entrydata', {
        uid: entryUid,
        locale: source,
      });

      const fetchedEntryData = entryResponse.data;
      const selectedLang = languages.find((lang) => lang['name'] === selectedOption);

      // @ts-ignore
      const translationObjects: TranslationRequestTranslations[] = selectedLang.targets.map(
        (targetLang) => ({
          // @ts-ignore
          source: selectedLang.source,
          target: targetLang,
          // @ts-ignore
          connector: selectedLang.connector,
        })
      );

      const payload: TranslationRequest = {
        duedate: dueDate,
        email: isEmail && !isMachineTranslation ? email : '',
        urgent: isMachineTranslation ? true : isUrgent,
        'project-name': contentType?.info?.displayName ?? '',
        translations: translationObjects,
        entry: {
          uid: entryUid,
          name: determineEntryName(fetchedEntryData),
        },
      };

      const response = await post('/translationstudio/translate', payload);
      displayAlert(
        response.data === true ? 'success' : 'danger',
        response.data === true
          ? 'Translation request sent successfully'
          : 'Error requesting translation'
      );
    } catch (error: any) {
      displayAlert('danger', `The entry does not exist in the selected source locale (${source}).`);
      return;
    }
  };

  return (
    <>
      {showAlert && (
        <Box
          style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            minWidth: '400px',
            maxWidth: '90%',
          }}
        >
          <Alert closeLabel="Close" variant={alertType} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </Box>
      )}

      <Box padding={4} style={{ width: '100%', color: 'white' }}>
        <Box paddingBottom={4} textAlign="right" style={{ width: '100%' }}>
          <Flex justifyContent="flex-end">
            <img
              src={logoSvg}
              alt=""
              style={{
                maxWidth: '200px',
                height: 'auto',
              }}
            />
          </Flex>
        </Box>

        <Box paddingBottom={4}>
          {languages.length > 0 && (
            <Radio.Group
              onValueChange={handleRadioSelection}
              name="languages"
              aria-label="translationstudio settings"
            >
              <Typography variant="beta" tag="label" id="Sprachauswahl">
                translationstudio settings
              </Typography>
              {languages.map((lang) => (
                <Radio.Item key={lang.id} value={lang.name}>
                  {lang['name']}
                </Radio.Item>
              ))}
            </Radio.Group>
          )}
        </Box>

        {!isMachineTranslation && (
          <>
            <Box paddingBottom={4} paddingTop={4} style={{ color: 'white' }}>
              <Typography variant="beta" tag="label" paddingBottom={4}>
                Translation request
              </Typography>
            </Box>

            <Box paddingBottom={4} style={{ color: 'white' }}>
              <Checkbox
                onCheckedChange={handleUrgentChange}
                defaultChecked={isUrgent}
                style={{ color: 'white' }}
              >
                <Typography style={{ color: 'white' }}>
                  translate immediately (and ignore quotes)
                </Typography>
              </Checkbox>
            </Box>
            <Box paddingBottom={4} style={{ color: 'white' }}>
              <Checkbox
                onCheckedChange={handleEmailChange}
                defaultChecked={isEmail}
                style={{ color: 'white' }}
              >
                <Typography style={{ color: 'white' }}>
                  Send email notifications on translation status updates
                </Typography>
              </Checkbox>
            </Box>

            {!isUrgent ? (
              <Box paddingBottom={8} paddingTop={4}>
                <Box paddingBottom={4}>
                  <Typography variant="beta">Due Date</Typography>
                </Box>
                <DatePicker
                  onChange={handleDueDateChange}
                  selecteddate={dueDate ? new Date(dueDate) : null}
                />
              </Box>
            ) : null}
          </>
        )}

        <Button
          fullWidth
          onClick={handleTranslationRequest}
          disabled={!selectedOption}
          startIcon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" fill="currentColor" />
            </svg>
          }
        >
          {isUrgent || isMachineTranslation ? 'Translate' : 'Request translation'}
        </Button>
      </Box>
    </>
  );
};

export default TranslationMenu;
