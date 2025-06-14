/*
Strapi - translationstudio extension
Copyright (C) 2025 I-D Media GmbH, idmedia.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/
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
import TSlogoFarbig from '../assets/translationstudio.svg';

// @ts-ignore
import TSlogoWhite from "../assets/translationstudio-white.svg";

const getSubmitLabel = function (isUrgent: boolean, isMachineTranslation: boolean) {
  if (isMachineTranslation) return 'Translate with ai';
  else if (isUrgent) return 'Translate immediately';
  else return 'Request translation';
};

const TranslationMenu = () => {
  const [languages, setLanguages] = useState<MappingsResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [source, setSource] = useState('');
  const [email, setEmail] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);
  const [dueDate, setDueDate] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const { get, post } = getFetchClient();
  const context = useContentManagerContext();
  const { id, contentType, model } = context || {};
  const isCollectionType = contentType?.kind === 'collectionType';
  const [licenseValid, setLicenseValid] = useState<boolean | null>(null);
  const [tsIsAvailable, setTsIsAvailable] = useState(true);

  const selectedLang = Array.isArray(languages)
    ? languages.find((lang) => lang.name === selectedOption)
    : undefined;
  const isMachineTranslation = selectedLang?.machine ?? false;

  useEffect(() => {
    if (!model) return;

    get('/translationstudio/getLicense')
      .then((response) => {
        if (typeof response.data.license !== 'string') return false;

        return response.data.license !== '';
      })
      .then((hasLicense) => {
        setLicenseValid(hasLicense);
        if (!hasLicense) throw new Error('No license set');

        setTsIsAvailable(true);
        return get('/translationstudio/mappings');
      })
      .then((langs) => {
        if (langs.data && Array.isArray(langs.data) && langs.data.length > 0)
          setLanguages(langs.data);
      })
      .catch((err) => {
        console.error(err);
        setTsIsAvailable(false);
      });

    get('/translationstudio/email')
      .then((response) => {
        if (response.data.email) setEmail(response.data.email ?? '');
      })
      .catch(console.error);
  }, [setLicenseValid, setTsIsAvailable, setEmail, setLanguages, id, model, isCollectionType]);

  const handleUrgentChange = () => {
    if (isUrgent) {
      setIsUrgent(false);
      setDueDate(0);
    } else {
      setIsUrgent(true);
    }
  };

  const handleEmailChange = () => setIsEmail(!isEmail);

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

  const renderNotAvailable = function () {
    if (!tsIsAvailable) {
      return (
        <Box paddingBottom={4}>
          <Typography>The pugin is not available.</Typography>
        </Box>
      );
    }

    if (licenseValid === false) {
      return (
        <Box paddingBottom={4}>
          <Typography>
            Your translationstudio license is invalid. Please update your strapi configuration.
          </Typography>
        </Box>
      );
    }

    if (languages.length === 0) {
      return (
        <Box paddingBottom={4}>
          <Typography>
            No translation settings available. translationstudio has not been configured yet. Please
            add translation settings first.
          </Typography>
        </Box>
      );
    }

    return <></>;
  };

  const renderPlugin = function () {
    return (
      <>
        <Box paddingBottom={4}>
          <Radio.Group
            onValueChange={handleRadioSelection}
            name="languages"
            aria-label="translationstudio settings"
          >
            <Typography variant="beta" tag="label" id="Sprachauswahl">
              Translation Settings
            </Typography>
            {languages.map((lang) => (
              <Radio.Item key={lang.id} value={lang.name}>
                {lang['name']}
              </Radio.Item>
            ))}
          </Radio.Group>
        </Box>

        {!isMachineTranslation && (
          <>
            <Box paddingBottom={4} paddingTop={4}>
              <Typography variant="beta" tag="label" paddingBottom={4}>
                Additional Settings
              </Typography>
            </Box>

            <Box paddingBottom={4}>
              <Checkbox
                onCheckedChange={handleUrgentChange}
                defaultChecked={isUrgent}
               
              >
                <Typography>
                  translate immediately (and ignore quotes)
                </Typography>
              </Checkbox>
            </Box>
            <Box paddingBottom={4}>
              <Checkbox
                onCheckedChange={handleEmailChange}
                defaultChecked={isEmail}
               
              >
                <Typography>
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
          {getSubmitLabel(isUrgent, isMachineTranslation)}
        </Button>
      </>
    );
  };

  const pluginIsAvailable = function () {
    return licenseValid !== null && tsIsAvailable === true;
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

      <Box padding={4} style={{ width: '100%' }}>
        <Box paddingBottom={4} textAlign="right" style={{ width: '100%' }}>
          <Flex justifyContent="flex-end">
            <picture style={{
                maxWidth: '200px',
                width: "100%",
                height: 'auto',
              }}>
                <source srcSet={TSlogoFarbig} media="(prefers-color-scheme: light)"/>
                <source srcSet={TSlogoWhite} media="(prefers-color-scheme: dark)"/>
                <img src={TSlogoFarbig}/>
            </picture>
          </Flex>
        </Box>

        {!pluginIsAvailable() ? renderNotAvailable() : renderPlugin()}
      </Box>
    </>
  );
};

export default TranslationMenu;
