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
    Main,
    Box,
    Grid,
    Button,
    Typography,
    TextInput,
    Switch,
    Alert,
} from '@strapi/design-system';
import { useState, useEffect, useCallback } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
import TranslationstudioLogo from '../components/TranslationstudioLogo';
import { Badge } from '@strapi/design-system';

const apiService = {
    async loadLicense(get: Function) {
        try {
            const response = await get('/translationstudio/getLicense');
            return response.status === 204;
        } catch (err) {
            console.error(err);
        }
        return false;
    },

    async loadDevUrl(get: Function): Promise<string> {
        try {
            const response = await get('/translationstudio/devurl');
            return response.data?.url || '';
        } catch (err) {
            console.error(err);
            return '';
        }
    },

    async updateDevUrl(post: Function, url: string): Promise<boolean> {
        try {
            const response = await post('/translationstudio/devurl', { url });
            return response.data?.success || false;
        } catch (err) {
            console.error(err);
            return false;
        }
    },
};

const styles = {
    textInput: {
        width: "90%",
        display: "inline-block",
    },
    button: {
        backgroundColor: '#e94642',
        border: 'none',
        paddingTop: '0.6em',
        paddingBottom: '0.6em',
    },
    tab: {
        color: '#e94642',
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: '600',
    },
    activeTab: {
        textDecoration: 'underline',
    },
    inactiveTab: {
        opacity: 0.7,
    },
    alert: {
        position: 'fixed' as const,
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        minWidth: '400px',
        maxWidth: '90%',
    },
};

type AlertVariant = 'success' | 'danger';

const SettingsPage = () => {
    const [licenseValue, setLicenseValue] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [devUrl, setDevUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingToken, setIsLoadingToken] = useState(false);
    const [showDevOptions, setShowDevOptions] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<AlertVariant>('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [originalLicense, setOriginalLicense] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    const { get, post } = getFetchClient();

    const displayAlert = useCallback((variant: AlertVariant, message?: string) => {
        const defaultMessage = variant === 'success' ? 'License saved' : 'Error saving license';
        setAlertType(variant);
        setAlertMessage(message || defaultMessage);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [license, devUrlData] = await Promise.all([
                    apiService.loadLicense(get),
                    apiService.loadDevUrl(get),
                ]);

                if (license)
                    setOriginalLicense(license);

                if (devUrlData) {
                    setDevUrl(devUrlData);
                    setShowDevOptions(true);
                }
            } catch (err) {
                console.error('Failed to load initial data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [setIsLoading, setDevUrl, setShowDevOptions, setOriginalLicense]);

    useEffect(() => {
        const fetchToken = async () => {
            setIsLoadingToken(true);
            try {
                const response = await get('/translationstudio/getToken');
                setHasToken(response.data?.token ? true : false);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingToken(false);
            }
        };
        fetchToken();
    }, [setIsLoadingToken, setHasToken]);

    const handleLicenseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLicenseValue(e.target.value.trim());
    }, []);

    const handleSaveLicense = useCallback(async () => {
        try {
            await post('/translationstudio/setLicense', { license: licenseValue });
            displayAlert('success');
            setOriginalLicense(true);
        } catch (err) {
            console.error(err);
            displayAlert('danger');
        }
    }, [post, licenseValue, setOriginalLicense, displayAlert]);

    const handleGenerateToken = useCallback(async () => {
        setIsLoadingToken(true);
        try {
            const response = await post('/translationstudio/generateToken');
            if (response.data?.token) {
                setTokenValue(response.data.token);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingToken(false);
        }
    }, [post]);

    const handleUpdateUrl = useCallback(async () => {
        setIsLoading(true);
        try {
            await apiService.updateDevUrl(post, devUrl);
            if (devUrl === '') setShowDevOptions(false);
        } finally {
            setIsLoading(false);
        }
    }, [post, devUrl]);

    const handleDevOptionsToggle = useCallback(
        (val: boolean) => {
            if (val) {
                setShowDevOptions(val);
            } else {
                apiService.updateDevUrl(post, '').finally(() => setShowDevOptions(val));
            }
        },
        [post]
    );

    const ActionButton = ({
        onClick,
        disabled,
        loading,
        children,
        icon,
    }: {
        onClick: () => void;
        disabled?: boolean;
        loading?: boolean;
        children: React.ReactNode;
        icon: React.ReactNode;
    }) => (
        <Button
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            size="L"
            startIcon={icon}
        >
            {children}
        </Button>
    );

    const LinkText = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: '#e94642' }}
        >
            {children}
        </a>
    );

    return (
        <Main>
            {showAlert && (
                <Box style={styles.alert}>
                    <Alert closeLabel="Close" variant={alertType} onClose={() => setShowAlert(false)}>
                        {alertMessage}
                    </Alert>
                </Box>
            )}

            <Box padding={10} style={{ minHeight: '90vh', marginTop: '5vh' }}>
                <Grid.Root>
                    {/* Logo */}
                    <Grid.Item xs={12}>
                        <Box style={{ textAlign: 'right', width: '100%' }}>
                            <picture
                                style={{
                                    width: '150px',
                                    height: 'auto',
                                    display: 'inline-block',
                                }}
                            >
                                <TranslationstudioLogo />
                            </picture>
                        </Box>
                    </Grid.Item>

                    {/* Content */}
                    <>
                        {/* License Section */}
                        <Grid.Item xs={12} style={{ paddingTop: '2em' }}>
                            <Typography variant="beta">translationstudio License</Typography>
                        </Grid.Item>
                        <Grid.Item xs={12} style={{ paddingBottom: '1em' }}>
                            <Typography variant="charlie">
                                You can create or revoke a license at{' '}
                                <LinkText href="https://account.translationstudio.tech/">
                                    account.translationstudio.tech
                                </LinkText>
                            </Typography>
                        </Grid.Item>
                        {originalLicense && (<Grid.Item xs={12} style={{ paddingBottom: "2em"}}>
                            <Badge>
                                License is available.
                            </Badge>
                        </Grid.Item>)}

                        <Grid.Item xs={10}>
                            <div style={{ display: "block", width: "95%" }}>
                                <TextInput
                                    name="jwt-token"
                                    label="JWT Token"
                                    placeholder="Paste your Strapi translationstudio license into this field and click save to apply it to this project"
                                    value={licenseValue}
                                    onChange={handleLicenseChange}
                                    disabled={isLoading}
                                    style={styles.textInput}
                                />
                            </div>
                        </Grid.Item>
                        <Grid.Item xs={2}>
                            <ActionButton
                                onClick={handleSaveLicense}
                                disabled={isLoading || licenseValue.length < 30}
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h6V6h1v3H8V6H9ZM8,18V14h8v4Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                }
                            >
                                {originalLicense ? "Update" : "Save"} license
                            </ActionButton>
                        </Grid.Item>

                        {/* Token Section */}
                            <Grid.Item xs={10}  style={{ paddingTop: '5em' }}>
                                <Box>
                                    <h2><Typography variant="beta">Authorize translationstudio requests</Typography></h2>
                                    <p>
                                        <Typography variant="charlie" style={{ paddingBottom: '1em' }}>
                                            When translationstudio connects with this plugin it will use the following access key to authorize itself.
                                        </Typography>
                                    </p>
                                </Box>
                            </Grid.Item>
                            <Grid.Item xs={2} style={{ textAlign: "right", paddingTop: '5em' }}>
                                <ActionButton
                                    onClick={handleGenerateToken}
                                    disabled={isLoadingToken}
                                    loading={isLoadingToken}
                                    icon={
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    }
                                >
                                    {isLoadingToken ? 'Generating...' : 'Generate new access key'}
                                </ActionButton>
                            </Grid.Item>

                        <Grid.Item xs={12} style={{ paddingTop: "2em"}}>
                            <Badge style={{ overflow: "hidden" }}>
                                {tokenValue ? tokenValue :
                                    (hasToken ? "Your existing access token will remain a secret" : "Generate an access key to validate incoming requests")
                                }
                            </Badge>
                        </Grid.Item>

                        {/* Customization Section */}
                        <Grid.Item xs={12} style={{ paddingTop: '5em' }}>
                            <Typography variant="beta">Customization</Typography>
                        </Grid.Item>
                        <Grid.Item xs={12} style={{ paddingBottom: '1em' }}>
                            <Typography variant="charlie">
                                You will not need these settings, but you might want to customize your
                                translationstudio instance.
                            </Typography>
                        </Grid.Item>
                        <Grid.Item xs={12}>
                            <Switch
                                checked={showDevOptions}
                                onCheckedChange={() => handleDevOptionsToggle(!showDevOptions)}
                                onLabel="Use custom translationstudio URL"
                                offLabel="Custom translationstudio URL is currently disabled (default)"
                                visibleLabels
                            />
                        </Grid.Item>

                        {/* Dev Options */}
                        {showDevOptions && (
                            <>
                                <Grid.Item xs={12} style={{ paddingTop: '2em' }}>
                                    <Typography variant="beta">Use custom translationstudio URL.</Typography>
                                </Grid.Item>
                                <Grid.Item xs={12} style={{ paddingBottom: '1em' }}>
                                    <Typography variant="delta">
                                        This is usually only necessary for development purposes.
                                    </Typography>
                                </Grid.Item>
                                <Grid.Item xs={10}>
                                    <div style={{ display: "block", width: "95%" }}>
                                        <TextInput
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDevUrl(e.target.value.trim())
                                            }
                                            name="devurl"
                                            label="Custom translationstudio url"
                                            placeholder="Paste your custom translationstudio url here"
                                            value={devUrl}
                                            style={styles.textInput}
                                        />
                                    </div>
                                </Grid.Item>
                                <Grid.Item xs={2}>
                                    <ActionButton
                                        onClick={handleUpdateUrl}
                                        disabled={isLoading}
                                        loading={isLoading}
                                        icon={
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                                            </svg>
                                        }
                                    >
                                        Update URL
                                    </ActionButton>
                                </Grid.Item>
                            </>
                        )}

                        {/* Footer */}
                        <Grid.Item xs={12} style={{ paddingTop: '4em' }}>
                            <Typography variant="sigma" style={{ textAlign: 'right' }}>
                                If you do not have a translationstudio account, please create one at{' '}
                                <LinkText href="https://account.translationstudio.tech/">
                                    account.translationstudio.tech
                                </LinkText>
                                . You can find further information at{' '}
                                <LinkText href="https://www.translationstudio.tech/">
                                    translationstudio.tech
                                </LinkText>
                            </Typography>
                        </Grid.Item>
                    </>
                </Grid.Root>
            </Box>
        </Main>
    );
};

export { SettingsPage };
