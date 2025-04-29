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
import { Main, Box, Flex, Button, Typography, Textarea, Alert } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
// @ts-ignore
import TSlogoFarbig from '../assets/translationstudio.svg';

const SettingsPage = () => {
  const [licenseValue, setLicenseValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [tokenValue, setTokenValue] = useState('');
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success');
  const [alertMessage, setAlertMessage] = useState('');

  const { get, post } = getFetchClient();

  useEffect(() => {
    const getLicense = async () => 
    {
      setIsLoading(true);
      try
      {
        const response = await get('/translationstudio/getLicense');
        if (response.data.license) {
          setLicenseValue(response.data.license);
        } else {
          setLicenseValue('');
        }
      }
      catch (err)
      {
        console.error(err);
      }
      finally {
        setIsLoading(false);
      }
    };
    getLicense();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoadingToken(true);
      try{
        const response = await get('/translationstudio/getToken');
        if (response.data.token) {
          setTokenValue(response.data.token);
        } else {
          setTokenValue('');
        }
      }
      catch (err)
      {
        console.error(err);
      }
      finally {
        setIsLoadingToken(false);
      }
    };
    fetchToken();
  }, []);

  const handleLicenseChange = (e: any) => {
    setLicenseValue(e.target.value);
  };

  const handleSaveLicense = async () => {
    
    try
    {
      const response = await post('/translationstudio/setLicense', { license: licenseValue });
      if (response) {
        displayAlert('success');
        return;
      }
    } 
    catch (err)
    {
      console.error(err);
    }

    displayAlert('danger');
  };

  const displayAlert = (variant: 'success' | 'danger') => {
    let message = variant === 'success' ? 'License saved' : 'Error saving license';
    setAlertType(variant);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleGenerateToken = async () => {
    setIsLoadingToken(true);
    try
    {
      const response = await post('/translationstudio/generateToken');
      if (response.data?.token) {
        setTokenValue(response.data.token);
      }
    }
    catch (err)
    {
      console.error(err);
    }
    finally {
      setIsLoadingToken(false);
    }
  };

  return (
    <Main>
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
      <Box
        padding={10}
        paddingBottom={0}
        style={{
          height: '90vh',
          marginTop: '5vh',
          backgroundColor: 'white',
          color: 'grey',
        }}
      >
        <Flex direction="column" gap={6}>
          <img
            src={TSlogoFarbig}
            alt="Translation Studio Logo"
            style={{
              maxWidth: '300px',
              height: 'auto',
            }}
          />
          <Typography variant="beta" style={{ textAlign: 'left' }}>
            translationstudio License
          </Typography>
          <Typography variant="charlie">
            You can create or revoke a license at{' '}
            <a
              href="https://account.translationstudio.tech/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: '#e94642', textAlign: 'left' }}
            >
              account.translationstudio.tech
            </a>{' '}
          </Typography>
          <Flex gap={2}>
            <Textarea
              name="jwt-token"
              label="JWT Token"
              placeholder="Paste your Strapi translationstudio license into this field and click save to apply it to this project"
              aria-label="Strapi license Input"
              value={licenseValue}
              onChange={handleLicenseChange}
              disabled={isLoading}
              style={{
                color: 'grey',
                width: '25vw',
                textAlign: 'left',
                backgroundColor: '#f6f6f6',
                cursor: 'text',
              }}
            />
          </Flex>

          <Box style={{ minHeight: '40px' }}>
            {!isLoading && (
              <Flex gap={2}>
                <Button
                  onClick={handleSaveLicense}
                  style={{ backgroundColor: '#e94642', border: 'none' }}
                  startIcon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h6V6h1v3H8V6H9ZM8,18V14h8v4Z"
                        fill="currentColor"
                      />
                    </svg>
                  }
                >
                  Save license
                </Button>
              </Flex>
            )}
          </Box>

          <Typography variant="beta">
            Authorize incoming translationstudio connection against this access key
          </Typography>
          <Flex gap={2}>
            <Textarea
              name="access-token"
              label="Access Key"
              placeholder="Generate an access key to validate incoming requests"
              aria-label="Access Key Input"
              value={tokenValue}
              onChange={() => {}}
              disabled={true}
              style={{
                color: 'grey',
                width: '25vw',
                textAlign: 'left',
                backgroundColor: '#f6f6f6',
                cursor: 'default',
              }}
            />
          </Flex>

          <Box style={{ minHeight: '40px' }}>
            <Button
              onClick={handleGenerateToken}
              style={{ backgroundColor: '#e94642', border: 'none' }}
              disabled={isLoadingToken}
              loading={isLoadingToken}
              startIcon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"
                    fill="currentColor"
                  />
                </svg>
              }
            >
              {isLoadingToken ? 'Generating...' : (tokenValue ? 'Generate new access key' : 'Generate access key')}
            </Button>
          </Box>

          <Box>
            <Typography variant="delta">
              If you do not have a{' '}
              <a
                href="https://www.translationstudio.tech/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#e94642' }}
              >
                translationstudio
              </a>{' '}
              account, please create one at{' '}
              <a
                href="https://account.translationstudio.tech/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#e94642' }}
              >
                account.translationstudio.tech
              </a>
              .
            </Typography>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
};

export { SettingsPage };
