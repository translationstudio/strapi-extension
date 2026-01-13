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

import { HistoryDataMap, HistoryItem } from '../../../Types';
import { handleHistoryResponse } from '../components/utils/handleHistoryResponse';
import TranslationstudioLogo from '../components/TranslationstudioLogo';

const processHistoryData = function(list:HistoryItem[])
{
  const map:HistoryDataMap = {};

  for (const elem of list)
  {
    const id = elem['element-uid'].split("#");
    if (id.length !== 2)
      continue;
    
    if (!map[id[0]])
      map[id[0]] = [elem];
    else 
      map[id[0]].push(elem);
  }

  return map;
}

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState<HistoryDataMap>({ });

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  const { get } = getFetchClient();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await get('/translationstudio/history');
        const result = handleHistoryResponse(response.data);

        if (result.isError) 
          throw new Error("Cold not fetch data");
        
        if (result.historyData && Array.isArray(result.historyData))
          setHistoryData(processHistoryData(result.historyData));
        
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistoryData({});
      }
      finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [setHistoryData, setIsLoadingHistory]);

  const refreshHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await get('/translationstudio/history');
      const result = handleHistoryResponse(response.data);

      if (result.isError) 
        setHistoryData( {} );
       else  if (result.historyData && Array.isArray(result.historyData))
        setHistoryData(processHistoryData(result.historyData));

    } catch (error) {
      setHistoryData({ });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <Main>
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

          {/* Toggle Buttons */}
          <Grid.Item xs={12}>
            <Box paddingBottom={4}>
              <Flex gap={2}>
                <Button
                  variant={activeTab === 'history' ? "default" : "tertiary"}
                  onClick={() => setActiveTab('history')}
                >
                  Translation History
                </Button>
                <Button
                  variant={activeTab === 'bulk' ? "default" : "tertiary"}
                  onClick={() => setActiveTab('bulk')}
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
                historyData={historyData}
                isLoadingHistory={isLoadingHistory}
                onTranslationComplete={refreshHistoryData}
              />
            )}

            {activeTab === 'history' && (
              <HistoryMenu
                // @ts-ignore
                historyData={historyData}
                isLoadingHistory={isLoadingHistory}
                onRefresh={refreshHistoryData}
              />
            )}
          </Grid.Item>
        </Grid.Root>
      </Box>
    </Main>
  );
};

export { HistoryPage };
