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
  ProgressBar,
  TextInput,
} from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
import { BulkTranslationPanelProps, MappingsResponse } from '../../../Types';
import {
  determineEntryName,
  createTranslationPayload,
  getSubmitLabel,
  createEntryUid,
} from './utils/translationUtils';
import { getStoredEmail, setStoredEmail } from './utils/emailUtils';
import { validateDueDate } from './utils/dateUtils';
import {
  createSuccessMessage,
  createErrorMessage,
  createGeneralErrorMessage,
  AlertType,
} from './utils/alertUtils';
import { getThemeColors, useThemeMode } from './utils/theme';

const LoadingSpinner = () => (
  <Box paddingBottom={4} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Box
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <Typography>Loading translation settings...</Typography>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </Box>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <Box paddingBottom={4}>
    <Typography>{message}</Typography>
  </Box>
);

const LanguageSelector = ({
  languages,
  selectedOption,
  onSelectionChange,
  themeColors,
}: {
  languages: MappingsResponse[];
  selectedOption: string;
  onSelectionChange: (value: string) => void;
  themeColors: ReturnType<typeof getThemeColors>;
}) => (
  <Box paddingBottom={4} style={{ color: themeColors.primaryText }}>
    <Radio.Group
      onValueChange={onSelectionChange}
      value={selectedOption}
      name="languages"
      aria-label="translationstudio settings"
    >
      <Typography
        variant="omega"
        tag="label"
        paddingBottom={2}
        style={{ color: themeColors.primaryText }}
      >
        Languages / Connectors
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
  themeColors,
}: {
  isUrgent: boolean;
  isEmail: boolean;
  email: string;
  dueDate: number;
  onUrgentChange: () => void;
  onEmailChange: () => void;
  onEmailInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDueDateChange: (date: Date) => void;
  themeColors: ReturnType<typeof getThemeColors>;
}) => (
  <>
    <Box paddingBottom={4}>
      <Typography
        variant="omega"
        tag="label"
        style={{ color: themeColors.primaryText }}
        paddingBottom={4}
      >
        Additional Settings
      </Typography>
    </Box>

    <Box paddingBottom={4}>
      <Checkbox onCheckedChange={onUrgentChange} defaultChecked={isUrgent}>
        <Typography variant="omega" style={{ color: themeColors.primaryText }}>
          translate immediately (and ignore quotes)
        </Typography>
      </Checkbox>
    </Box>

    <Box paddingBottom={4}>
      <Checkbox onCheckedChange={onEmailChange} defaultChecked={isEmail}>
        <Typography variant="omega" style={{ color: themeColors.primaryText }}>
          Send email notifications on translation status updates
        </Typography>
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
      <Box paddingBottom={4}>
        <Box paddingBottom={2}>
          <Typography variant="omega" style={{ color: themeColors.primaryText }}>
            Due Date
          </Typography>
        </Box>
        <DatePicker onChange={onDueDateChange} selecteddate={dueDate ? new Date(dueDate) : null} />
      </Box>
    )}
  </>
);

const ProgressIndicator = ({ progress }: { progress: number }) => (
  <Box paddingBottom={4}>
    <Typography variant="omega" paddingBottom={2}>
      Processing... {Math.round(progress)}%
    </Typography>
    <ProgressBar value={progress} />
  </Box>
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

const BulkTranslationPanel = ({
  contentType,
  selectedEntries,
  onTranslationComplete,
}: BulkTranslationPanelProps) => {
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingsError, setMappingsError] = useState(false);

  const themeColors = getThemeColors();
  const isDark = useThemeMode();

  const { get, post } = getFetchClient();

  const selectedLang = languages.find((lang) => lang.name === selectedOption);
  const isMachineTranslation = selectedLang?.machine ?? false;

  useEffect(() => {
    if (!contentType) return;

    setIsLoadingMappings(true);
    setMappingsError(false);

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
  }, [contentType]);

  useEffect(() => {
    if (!contentType || !isEmail) return;
    const savedEmail = getStoredEmail();
    if (savedEmail) {
      setEmail(savedEmail);
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

  const displayAlert = (type: AlertType, message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleBulkTranslationRequest = async () => {
    if (!contentType || !selectedLang) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < selectedEntries.length; i++) {
        const entryId = selectedEntries[i];
        setProgress(((i + 1) / selectedEntries.length) * 100);

        try {
          const entryUid = createEntryUid(contentType, entryId);

          const entryResponse = await post('/translationstudio/entrydata', {
            uid: entryUid,
            locale: source,
          });

          const fetchedEntryData = entryResponse.data;
          const entryName = determineEntryName(fetchedEntryData, contentType.displayName);

          const payload = createTranslationPayload(
            selectedLang,
            dueDate,
            isEmail,
            isMachineTranslation,
            email,
            isUrgent,
            contentType.displayName,
            entryUid,
            entryName
          );

          const response = await post('/translationstudio/translate', payload);

          if (response.data === true) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Failed to translate entry ${entryId}:`, error);
          errorCount++;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (errorCount === 0) {
        const { type, message } = createSuccessMessage(successCount, selectedEntries.length);
        displayAlert(type, message);
      } else if (successCount === 0) {
        const { type, message } = createErrorMessage(selectedEntries.length);
        displayAlert(type, message);
      } else {
        const { type, message } = createSuccessMessage(successCount, selectedEntries.length);
        displayAlert(type, message);
      }

      onTranslationComplete();
    } catch (error: any) {
      console.error('Bulk translation error:', error);
      const { type, message } = createGeneralErrorMessage();
      displayAlert(type, message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
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

      <Box
        padding={4}
        style={{
          width: '100%',
          backgroundColor: themeColors.cardBackground,
          borderRadius: '4px',
        }}
      >
        {!pluginIsAvailable() ? (
          renderNotAvailable()
        ) : (
          <>
            <LanguageSelector
              languages={languages}
              selectedOption={selectedOption}
              onSelectionChange={handleRadioSelection}
              themeColors={themeColors}
            />

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
                themeColors={themeColors}
              />
            )}

            {isProcessing && <ProgressIndicator progress={progress} />}

            <Button
              fullWidth
              onClick={handleBulkTranslationRequest}
              disabled={!selectedOption || isProcessing}
              loading={isProcessing}
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
              {getSubmitLabel(selectedEntries.length, isUrgent, isMachineTranslation)}
            </Button>
          </>
        )}
      </Box>
    </>
  );
};

export default BulkTranslationPanel;
