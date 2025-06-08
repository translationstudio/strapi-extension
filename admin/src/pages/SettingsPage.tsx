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
import { Main, Box, Grid, Button, Typography, TextInput, Switch, Alert } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
import { ArrowClockwise, Play } from '@strapi/icons';

// @ts-ignore
import TSlogoFarbig from '../assets/translationstudio.svg';

async function loadLicense(fnGet: Function): Promise<string> {
    try {
        const response = await fnGet('/translationstudio/getLicense');
        if (typeof response.data?.license === "string")
            return response.data.license;
    }
    catch (err) {
        console.error(err);
    }

    return "";
}


async function loadDevUrl(fnGet: Function): Promise<string> {
    try {
        const response = await fnGet('/translationstudio/devurl');
        if (typeof response.data?.url === "string")
            return response.data.url;
    }
    catch (err) {
        console.error(err);
    }

    return "";
}

async function updateDevlUrl(fnPost: Function, url: string): Promise<boolean> {
    try {
        const response = await fnPost('/translationstudio/devurl', { url: url });
        if (typeof response.data?.success === "boolean")
            return response.data.success;
    }
    catch (err) {
        console.error(err);
    }

    return false;
}

const TextareaStyle = {
    color: 'grey',
    width: "100%",
    display: "block",
    backgroundColor: '#f6f6f6',
    cursor: 'default',
}

const BUttonStyle ={ backgroundColor: '#e94642', border: 'none', paddingTop: "0.6em", paddingBottom: "0.6em" }


const SettingsPage = () => {
    const [licenseValue, setLicenseValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [tokenValue, setTokenValue] = useState('');
    const [isLoadingToken, setIsLoadingToken] = useState(false);
    const [showDevOptions, setShowDevOptions] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'danger'>('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [devUrl, setDevUrl] = useState("");

    const { get, post } = getFetchClient();

    useEffect(() => {
        const getLicense = async () => {
            setIsLoading(true);
            
            const license = await loadLicense(get);
            if (license)
              setLicenseValue(license);
      
            const dUrl = await loadDevUrl(get);
            if (dUrl)
            {
              console.log(dUrl)
              setDevUrl(dUrl);
              setShowDevOptions(true);
            }
          
            setIsLoading(false);
        };
        getLicense();
    }, [setLicenseValue, setDevUrl, setIsLoading, setShowDevOptions]);

    useEffect(() => {
        const fetchToken = async () => {
            setIsLoadingToken(true);
            try {
                const response = await get('/translationstudio/getToken');
                if (response.data.token) {
                    setTokenValue(response.data.token);
                } else {
                    setTokenValue('');
                }
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setIsLoadingToken(false);
            }
        };
        fetchToken();
    }, []);

    const handleLicenseChange = (e: any) => {
        setLicenseValue(e.target.value.trim());
    };

    const handleUpdateUrl = async function()
    {
        setIsLoading(true);
        updateDevlUrl(post, devUrl)
        .then(() => {
            if (devUrl === "")
                setShowDevOptions(false);
        })
        .finally(() => setIsLoading(false));
    }

    const handleSaveLicense = async () => {

        try {
            const response = await post('/translationstudio/setLicense', { license: licenseValue });
            if (response) {
                displayAlert('success');
                return;
            }
        }
        catch (err) {
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
        try {
            const response = await post('/translationstudio/generateToken');
            if (response.data?.token) {
                setTokenValue(response.data.token);
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsLoadingToken(false);
        }
    };

    const onChangeDevOptions = function (val: boolean) {
        if (val)
            setShowDevOptions(val);
        else
            updateDevlUrl(post, "").finally(() => setShowDevOptions(val));
    }

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
                style={{
                    minHeight: '90vh',
                    marginTop: '5vh',
                    backgroundColor: 'white',
                    color: 'grey',
                }}
            >
                <Grid.Root>
                    <Grid.Item xs={12} >
                        <Box style={{textAlign: "right", width: "100%"}}>
                            <img
                                src={TSlogoFarbig}
                                alt="Translation Studio Logo"
                                style={{
                                    width: '300px',
                                    height: 'auto',
                                    display: "inline-block"
                                }}
                            />
                        </Box>
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingTop: "2em"}}>
                        <Typography variant="beta" style={{ width: "100%" }}>
                            translationstudio License
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingBottom: "1em"}}>
                        <Typography variant="charlie" style={{ width: "100%" }}>
                            You can create or revoke a license at{' '}
                            <a
                                href="https://account.translationstudio.tech/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#e94642' }}
                            >
                                account.translationstudio.tech
                            </a>
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={10}>
                        <Box style={{ width: "100%"}}>
                            <TextInput
                                name="jwt-token"
                                label="JWT Token"
                                placeholder="Paste your Strapi translationstudio license into this field and click save to apply it to this project"
                                aria-label="Strapi license Input"
                                value={licenseValue}
                                onChange={handleLicenseChange}
                                disabled={isLoading}
                                style={TextareaStyle}
                            />
                        </Box>
                    </Grid.Item>
                    <Grid.Item xs={2}>
                        <Button
                            onClick={handleSaveLicense}
                            disabled={isLoading}
                            style={BUttonStyle}
                            size="L"
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
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingTop: "3em"}}>
                        <Typography variant="beta">
                            Authorize translationstudio requests
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingBottom: "1em"}}>
                        <Typography variant="charlie" style={{ width: "100%" }}>
                            When translationstudio connects with this plugin it will use the following access key to authorize itself.
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={10}>
                        <Box style={{ width: "100%"}}>
                            <TextInput
                                name="access-token"
                                label="Access Key"
                                placeholder="Generate an access key to validate incoming requests"
                                aria-label="Access Key Input"
                                value={tokenValue}
                                onChange={() => { }}
                                disabled={true}
                                style={TextareaStyle}
                            />
                        </Box>
                    </Grid.Item>
                    <Grid.Item xs={2}>
                        <Button
                            onClick={handleGenerateToken}
                            style={BUttonStyle}
                            disabled={isLoadingToken}
                            loading={isLoadingToken}
                            size="L"
                            startIcon={<ArrowClockwise />}
                        >
                            {isLoadingToken ? 'Generating...' : (tokenValue ? 'New access key' : 'Create access key')}
                        </Button>
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingTop: "5em"}}>
                        <Typography variant="beta">
                            Customization
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={12} style={{ paddingBottom: "1em"}}>
                        <Typography variant="charlie" style={{ width: "100%" }}>
                            You will not need these settings, but you might want to customize your translationstudio instance.
                        </Typography>
                    </Grid.Item>
                    <Grid.Item xs={12}  >
                        <Switch
                            checked={showDevOptions}
                            onCheckedChange={() => onChangeDevOptions(!showDevOptions)}
                            onLabel="Use custom translationstudio URL"
                            offLabel="Custom translationstudio URL is currently disabled (default)"
                            visibleLabels
                        />
                    </Grid.Item>

                    {showDevOptions && <>
                        <Grid.Item xs={12} style={{ paddingTop: "2em"}}>
                            <Typography variant="beta">Use custom translationstudio URL.</Typography>
                        </Grid.Item>
                        <Grid.Item xs={12} style={{ paddingBottom: "1em"}}>
                            <Typography variant="delta">This is usually only necessary for development purposes.</Typography>
                        </Grid.Item>
                        <Grid.Item xs={10}>
                            <Box style={{ width: "100%"}}>
                                <TextInput
                                    onChange={(e: any) => setDevUrl(e.target.value.trim())}
                                    name="devurl"
                                    label="Custom translationstudio url"
                                    placeholder="Paste your custom translationstudio url here"
                                    aria-label="translationstudio custom url"
                                    value={devUrl}
                                    style={TextareaStyle}
                                />
                            </Box>
                        </Grid.Item>
                        <Grid.Item xs={2}>
                            <Button
                                onClick={handleUpdateUrl}
                                style={BUttonStyle}
                                disabled={isLoadingToken}
                                loading={isLoadingToken}
                                startIcon={<Play />}
                                size="L"
                            >
                                Update URL
                            </Button>
                        </Grid.Item>
                    </>}
                
                    <Grid.Item xs={12} style={{ paddingTop: "4em" }}>
                        <Typography variant="sigma" style={{ width: "100%", textAlign: "right"}}>
                            If you do not have a translationstudio account, please create one at{' '}
                            <a
                                href="https://account.translationstudio.tech/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#e94642' }}
                            >
                                account.translationstudio.tech
                            </a>
                            . You can find further information at <a
                                href="https://www.translationstudio.tech/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#e94642' }}
                            >
                                translationstudio.tech
                            </a>{' '}
                        </Typography>
                    </Grid.Item>
                </Grid.Root >
            </Box>
        </Main >
    );
};

export { SettingsPage };
