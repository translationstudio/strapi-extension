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
  TextInput,
} from '@strapi/design-system';
import { useState, useEffect } from 'react';
import {
  unstable_useContentManagerContext as useContentManagerContext,
  getFetchClient,
} from '@strapi/strapi/admin';
import { MappingsResponse } from '../../../Types';

import EntryHistory from './EntryHistory';
import { getStoredEmail, setStoredEmail } from './utils/emailUtils';
import { validateDueDate } from './utils/dateUtils';
import { createTranslationPayload, getSubmitLabel } from './utils/translationUtils';
import { createSuccessMessage, createErrorMessage, AlertType } from './utils/alertUtils';
import { determineEntryName, createEntryUid } from './utils/entryUtils';
import { LoadingSpinner, ErrorMessage } from './LoadingSpinner';
import TranslationstudioLogo from './TranslationstudioLogo';
import { PaperPlane } from '@strapi/icons';

const LanguageSelector = ({
  languages,
  onSelectionChange,
}: {
  languages: MappingsResponse[];
  onSelectionChange: (value: string) => void;
}) => (
  <Box paddingBottom={4}>
    <Radio.Group
      onValueChange={onSelectionChange}
      name="languages"
      aria-label="translationstudio settings"
    >
      <Typography variant="beta" tag="label" id="Sprachauswahl">
        Translation Settings
      </Typography>
      {languages.map((lang) => (
        <Radio.Item key={lang.id} value={lang.name}>
          {lang.name}
        </Radio.Item>
      ))}
    </Radio.Group>
  </Box>
);

const AdditionalSettings = ({
  isUrgent,
  isEmail,
  email,
  dueDate,
  onUrgentChange,
  onEmailChange,
  onEmailInputChange,
  onDueDateChange,
}: {
  isUrgent: boolean;
  isEmail: boolean;
  email: string;
  dueDate: number;
  onUrgentChange: () => void;
  onEmailChange: () => void;
  onEmailInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDueDateChange: (date: Date) => void;
}) => (
  <>
    <Box paddingBottom={4} paddingTop={4}>
      <Typography variant="beta" tag="label" paddingBottom={4}>
        Additional Settings
      </Typography>
    </Box>

    <Box paddingBottom={4}>
      <Checkbox onCheckedChange={onUrgentChange} defaultChecked={isUrgent}>
        <Typography>translate immediately (and ignore quotes)</Typography>
      </Checkbox>
    </Box>

    <Box paddingBottom={4}>
      <Checkbox onCheckedChange={onEmailChange} defaultChecked={isEmail}>
        <Typography>Send email notifications on translation status updates</Typography>
      </Checkbox>
    </Box>

    {isEmail && (
      <Box paddingBottom={4}>
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={onEmailInputChange}
          placeholder="Enter your email address"
        />
      </Box>
    )}

    {!isUrgent && (
      <Box paddingBottom={8} paddingTop={4}>
        <Box paddingBottom={4}>
          <Typography variant="beta">Due Date</Typography>
        </Box>
        <DatePicker onChange={onDueDateChange} selecteddate={dueDate ? new Date(dueDate) : null} />
      </Box>
    )}
  </>
);

const AlertMessage = ({
  show,
  type,
  message,
  onClose,
}: {
  show: boolean;
  type: AlertType;
  message: string;
  onClose: () => void;
}) => {
  if (!show) return null;

  return (
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
      <Alert closeLabel="Close" variant={type} onClose={onClose}>
        {message}
      </Alert>
    </Box>
  );
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
  const [alertType, setAlertType] = useState<AlertType>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [licenseValid, setLicenseValid] = useState<boolean | null>(null);
  const [tsIsAvailable, setTsIsAvailable] = useState(true);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingsError, setMappingsError] = useState(false);

  const { get, post } = getFetchClient();
  const context = useContentManagerContext();
  const { id, contentType, model } = context || {};
  const isCollectionType = contentType?.kind === 'collectionType';

  const selectedLang = Array.isArray(languages)
    ? languages.find((lang) => lang.name === selectedOption)
    : undefined;
  const isMachineTranslation = selectedLang?.machine ?? false;

  useEffect(() => {
    if (!model) return;

    setIsLoadingMappings(true);
    setMappingsError(false);

    get('/translationstudio/getLicense')
      .then((response) => {
        return response.status === 204;
      })
      .then((hasLicense) => {
        setLicenseValid(hasLicense);
        if (!hasLicense) throw new Error('No license set');

        setTsIsAvailable(true);
        return get('/translationstudio/mappings');
      })
      .then((langs) => {
        if (langs.data && Array.isArray(langs.data) && langs.data.length > 0) {
          setLanguages(langs.data);
          setMappingsError(false);
        } else {
          setLanguages([]);
          setMappingsError(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setTsIsAvailable(false);
        setMappingsError(true);
      })
      .finally(() => {
        setIsLoadingMappings(false);
      });
  }, [id, model, isCollectionType]);

  useEffect(() => {
    if (isEmail) {
      const savedEmail = getStoredEmail();
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [isEmail]);

  const handleUrgentChange = () => {
    if (isUrgent) {
      setIsUrgent(false);
      setDueDate(0);
    } else {
      setIsUrgent(true);
    }
  };

  const handleEmailChange = () => {
    const newEmailState = !isEmail;
    setIsEmail(newEmailState);

    if (newEmailState) {
      const savedEmail = getStoredEmail();
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } else {
      setEmail('');
    }
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setStoredEmail(newEmail);
  };

  const handleDueDateChange = (date: Date) => {
    const validatedDate = validateDueDate(date);
    setDueDate(validatedDate);
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

  const displayAlert = (variant: AlertType, message: string) => {
    setAlertType(variant);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const getEntryUid = () => {
    if (!model || !id) return '';
    return createEntryUid(isCollectionType || false, model, id);
  };

  const handleTranslationRequest = async () => {
    if (!selectedLang || !contentType || !id) return;

    const entryUid = getEntryUid();

    try {
      const entryResponse = await post('/translationstudio/entrydata', {
        uid: entryUid,
        locale: source,
      });

      const fetchedEntryData = entryResponse.data;
      const entryName = determineEntryName(
        fetchedEntryData,
        contentType.info?.displayName ?? '',
        id
      );

      const payload = createTranslationPayload(
        selectedLang,
        dueDate,
        isEmail,
        isMachineTranslation,
        email,
        isUrgent,
        contentType.info?.displayName ?? '',
        entryUid,
        entryName
      );

      const response = await post('/translationstudio/translate', payload);

      const { type, message } =
        response.data === true ? createSuccessMessage(1, 1) : createErrorMessage(1);

      displayAlert(
        type,
        response.data === true
          ? 'Translation request sent successfully'
          : 'Error requesting translation'
      );
    } catch (error: any) {
      displayAlert('danger', `The entry does not exist in the selected source locale (${source}).`);
    }
  };

  const renderNotAvailable = () => {
    if (isLoadingMappings) {
      return <LoadingSpinner />;
    }

    if (!tsIsAvailable || mappingsError) {
      return <ErrorMessage message="Error fetching translation settings." />;
    }

    if (licenseValid === false) {
      return (
        <ErrorMessage message="Your translationstudio license is invalid. Please update your strapi configuration." />
      );
    }

    if (languages.length === 0) {
      return (
        <ErrorMessage message="No translation settings available. translationstudio has not been configured yet. Please add translation settings first." />
      );
    }

    return null;
  };

  const renderPlugin = () => (
    <>
      <LanguageSelector languages={languages} onSelectionChange={handleRadioSelection} />

      {!isMachineTranslation && selectedOption !== '' && (
        <AdditionalSettings
          isUrgent={isUrgent}
          isEmail={isEmail}
          email={email}
          dueDate={dueDate}
          onUrgentChange={handleUrgentChange}
          onEmailChange={handleEmailChange}
          onEmailInputChange={handleEmailInputChange}
          onDueDateChange={handleDueDateChange}
        />
      )}

      <Button
        fullWidth
        onClick={handleTranslationRequest}
        disabled={!selectedOption}
        startIcon={<PaperPlane />}
      >
        {getSubmitLabel(1, isUrgent, isMachineTranslation)}
      </Button>
    </>
  );

  const pluginIsAvailable = () => {
    return !isLoadingMappings && licenseValid !== null && tsIsAvailable === true && !mappingsError;
  };

  return (
    <>
      <AlertMessage
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <Box padding={4} style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
        <picture
          style={{
            width: '85%',
            height: 'auto',
            display: 'inline-block',
          }}
        >
          <TranslationstudioLogo />
        </picture>
      </Box>
      <Box padding={4} style={{ textAlign: 'center', width: '100%' }}>
        {!pluginIsAvailable() ? renderNotAvailable() : renderPlugin()}
      </Box>

      <EntryHistory entryUid={getEntryUid()} />
    </>
  );
};

export default TranslationMenu;
