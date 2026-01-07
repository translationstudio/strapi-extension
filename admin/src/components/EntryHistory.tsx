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
import { getFetchClient } from '@strapi/strapi/admin';
import {
  Box,
  Typography,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@strapi/design-system';
import { ChevronDown, ChevronUp } from '@strapi/icons';
import { EntryHistoryProps, HistoryItem } from '../../../Types';
import { useState, useMemo } from 'react';
import { formatDate } from './utils/formatDate';
import { groupHistoryData, GroupedHistoryItem } from './utils/historyDataUtils';
import { handleHistoryResponse } from './utils/handleHistoryResponse';

const LoadingState = () => (
  <Box padding={4}>
    <Typography variant="omega">Loading entry history...</Typography>
  </Box>
);

const EmptyState = () => (
  <Box padding={4}>
    <Typography variant="omega" style={{ color: '#666' }}>
      No translation history available for this entry.
    </Typography>
  </Box>
);

const HistoryTable = ({ data }: { data: GroupedHistoryItem[] }) => (
  <Box>
    <Table colCount={3} rowCount={data.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma" fontWeight="bold">
              Target
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" fontWeight="bold">
              Date
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" fontWeight="bold">
              Status
            </Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item, index) => (
          <HistoryRow key={`${item['element-uid']}-${index}`} item={item} />
        ))}
      </Tbody>
    </Table>
  </Box>
);

const HistoryRow = ({ item }: { item: GroupedHistoryItem }) => (
  <Tr>
    <Td>
      <Typography variant="omega">
        {item.targetLanguages.map((lang) => lang.toUpperCase()).join(', ')}
      </Typography>
    </Td>
    <Td>
      <Typography variant="omega">{formatDate(item['time-intranslation'])}</Typography>
    </Td>
    <Td>
      {item.combinedStatus.text && (
        <Badge variant={item.combinedStatus.variant}>{item.combinedStatus.text}</Badge>
      )}
    </Td>
  </Tr>
);

const ToggleButton = ({
  isExpanded,
  isLoading,
  onClick,
}: {
  isExpanded: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="tertiary"
    onClick={onClick}
    startIcon={isExpanded ? <ChevronUp /> : <ChevronDown />}
    loading={isLoading}
    style={{ width: '100%', justifyContent: 'center' }}
  >
    <Typography variant="omega" fontWeight="semiBold">
      View translation history
    </Typography>
  </Button>
);

const EntryHistory = ({ entryUid }: EntryHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { get } = getFetchClient();

  const groupedHistoryData = useMemo(() => {
    return groupHistoryData(historyData);
  }, [historyData]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get('/translationstudio/history');
      const result = handleHistoryResponse(response.data);

      if (result.isError) {
        setError(result.errorMessage || 'Failed to fetch translation history.');
        setHistoryData([]);
      } else {
        setHistoryData(result.historyData);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to fetch translation history.');
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isExpanded && !hasLoaded) {
      await fetchHistory();
    }
    setIsExpanded(!isExpanded);
  };

  if (!entryUid) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <Box padding={4}>
          <Typography variant="beta" textColor="danger600">
            {error}
          </Typography>
        </Box>
      );
    }

    if (groupedHistoryData.length === 0) {
      return <EmptyState />;
    }

    return <HistoryTable data={groupedHistoryData} />;
  };

  return (
    <Box paddingTop={4} style={{ width: '100%' }}>
      <ToggleButton isExpanded={isExpanded} isLoading={isLoading} onClick={handleToggle} />

      {isExpanded && <Box paddingTop={4}>{renderContent()}</Box>}
    </Box>
  );
};

export default EntryHistory;
