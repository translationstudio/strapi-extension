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
import { Main, Box, Grid, Button, Flex } from '@strapi/design-system';
import { useEffect, useState } from 'react';
import { HistoryMenu } from '../components/HistoryMenu';
import { BulkTranslationMenu } from '../components/BulkTranslationMenu';
import { getFetchClient } from '@strapi/strapi/admin';

import { GroupedHistoryItem, HistoryItem } from '../../../Types';
import { handleHistoryResponse } from '../components/utils/handleHistoryResponse';
import TranslationstudioLogo from '../components/TranslationstudioLogo';
import { groupHistoryData } from '../components/utils/historyDataUtils';

const TranslationstudioLogoBox = function() {
    return <Box style={{ textAlign: 'right', width: '100%' }}>
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
}

type PanelType = "bulk"|"history"

const HistoryPage = () => {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [groupedHistoryData, setGroupedHistoryData] = useState<GroupedHistoryItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState(0);

    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [activeTab, setActiveTab] = useState<PanelType>('history');

    const { get } = getFetchClient();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await get('/translationstudio/history');
                const result = handleHistoryResponse(response.data);

                if (result.isError)
                    throw new Error("Cold not fetch data");

                if (result.historyData && Array.isArray(result.historyData)) {
                    setHistoryData(result.historyData as HistoryItem[]);
                    setGroupedHistoryData(groupHistoryData(result.historyData));
                    setLastUpdated(Date.now());
                }

            } catch (error) {
                console.error('Failed to fetch history:', error);
                setHistoryData([]);
                setGroupedHistoryData([]);
            }
            finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [setHistoryData, setIsLoadingHistory, setGroupedHistoryData, setLastUpdated]);

    const refreshHistoryData = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await get('/translationstudio/history');
            const result = handleHistoryResponse(response.data);

            if (result.isError)
            {
                setGroupedHistoryData([]);
                setHistoryData([]);
            }
            else if (result.historyData && Array.isArray(result.historyData)) {
                setHistoryData(result.historyData as HistoryItem[]);
                setGroupedHistoryData(groupHistoryData(result.historyData));
                setLastUpdated(Date.now());
            }
        } catch (error) {
            setHistoryData([]);
            setGroupedHistoryData([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const onRefreshHistoryClick = function()
    {
        if (Date.now() - lastUpdated > 1000 * 60 * 5)
            refreshHistoryData();
    }

    const onChangePage = function(input:PanelType)
    {
        onRefreshHistoryClick();
        setActiveTab(input);
    }

    const removeHistoryEntry = function(id:string)
    {
        if (!id || historyData.length === 0)
            return;

        if (historyData.length === 1)
        {
            setHistoryData([]);
            return;
        }

        let index = -1;
        for (let i = 0; i < historyData.length && index === -1; i++)
        {
            if (historyData[i].id === id)
                index = i;
        }

        if (index === -1)
            return;

        historyData.splice(index, 1);

        const res = [...historyData];
        setHistoryData(res);
        setGroupedHistoryData(groupHistoryData(res));
    }

    return (
        <Main>
            <Box padding={10} style={{ minHeight: '90vh', marginTop: '5vh' }}>
                <Grid.Root>
                    <Grid.Item xs={12}>
                        <TranslationstudioLogoBox />
                    </Grid.Item>

                    {/* Toggle Buttons */}
                    <Grid.Item xs={12}>
                        <Box paddingBottom={4}>
                            <Flex gap={2}>
                                <Button
                                    variant={activeTab === 'history' ? "default" : "tertiary"}
                                    disabled={isLoadingHistory}
                                    onClick={() => onChangePage('history')}
                                >
                                    Translation History
                                </Button>
                                <Button
                                    variant={activeTab === 'bulk' ? "default" : "tertiary"}
                                    disabled={isLoadingHistory}
                                    onClick={() => onChangePage('bulk')}
                                >
                                    Translate multiple entries
                                </Button>
                            </Flex>
                        </Box>
                    </Grid.Item>

                    {/* Content */}
                    <Grid.Item xs={12}>
                        {activeTab === 'bulk' && (
                            <BulkTranslationMenu
                                groupedHistoryData={groupedHistoryData}
                                isLoadingHistory={isLoadingHistory}
                                onTranslationComplete={refreshHistoryData}
                            />
                        )}

                        {activeTab === 'history' && (
                            <HistoryMenu
                                groupedHistoryData={groupedHistoryData}
                                onRemoveHistoryItem={(id) => removeHistoryEntry(id)}
                             />
                        )}
                    </Grid.Item>
                </Grid.Root>
            </Box>
        </Main>
    );
};

export { HistoryPage };
