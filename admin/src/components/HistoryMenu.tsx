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
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  TextInput,
} from '@strapi/design-system';
import { useState, useEffect, useMemo } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
import { HistoryItem } from '../../../Types';
import { formatDate } from './utils/formatDate';
import { groupHistoryData, GroupedHistoryItem } from './utils/historyDataUtils';
import { getSearchableText, filterBySearchTerm } from './utils/searchUtils';
import { SortField, SortState, sortItems, getNextSortState } from './utils/sortUtils';
import { useDebounce } from './utils/useDebounce';
import { handleHistoryResponse } from './utils/handleHistoryResponse';

const DEBOUNCE_DELAY = 500;

const LoadingState = () => (
  <Box padding={4}>
    <Typography variant="beta">Loading history...</Typography>
  </Box>
);

const EmptyState = ({ hasSearchTerm }: { hasSearchTerm: boolean }) => (
  <Box padding={4}>
    <Typography variant="omega" style={{ color: '#666' }}>
      {hasSearchTerm
        ? 'No matching translation history found.'
        : 'No translation history available.'}
    </Typography>
  </Box>
);

type SearchInputData = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput = ({ value, onChange }: SearchInputData) => (
  <Box paddingBottom={4}>
    <TextInput
      placeholder="Search by content type, entry, ID, target language, or status..."
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  </Box>
);

const SortableHeader = ({
  field,
  currentSort,
  onSort,
  children,
}: {
  field: SortField;
  currentSort: SortState;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) => (
  <Th>
    <Box
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onClick={() => onSort(field)}
    >
      <Typography variant="sigma" fontWeight="bold">
        {children}
      </Typography>
      {currentSort.field === field && (
        <span style={{ fontSize: '12px' }}>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
      )}
    </Box>
  </Th>
);

const HistoryTable = ({
  data,
  sortState,
  onSort,
}: {
  data: GroupedHistoryItem[];
  sortState: SortState;
  onSort: (field: SortField) => void;
}) => (
  <Box
    style={{
      borderRadius: '4px',
    }}
  >
    <Table colCount={6} rowCount={data.length + 1}>
      <Thead>
        <Tr>
          <SortableHeader field="project-name" currentSort={sortState} onSort={onSort}>
            Content Type
          </SortableHeader>
          <SortableHeader field="element-name" currentSort={sortState} onSort={onSort}>
            Entry
          </SortableHeader>
          <SortableHeader field="element-uid" currentSort={sortState} onSort={onSort}>
            ID
          </SortableHeader>
          <SortableHeader field="status" currentSort={sortState} onSort={onSort}>
            Status
          </SortableHeader>
          <SortableHeader field="target-language" currentSort={sortState} onSort={onSort}>
            Target Language
          </SortableHeader>
          <SortableHeader field="time-imported" currentSort={sortState} onSort={onSort}>
            Date
          </SortableHeader>
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
      {/* @ts-ignore */}
      <Typography variant="omega">{item['project-name']}</Typography>
    </Td>
    <Td>
      {/* @ts-ignore */}
      <Typography variant="omega">{item['element-name']}</Typography>
    </Td>
    <Td>
      <Typography variant="omega" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
        {item['element-uid']}
      </Typography>
    </Td>
    <Td>
      {item.combinedStatus.text && (
        <Badge variant={item.combinedStatus.variant}>{item.combinedStatus.text}</Badge>
      )}
    </Td>
    <Td>
      <Typography variant="omega">
        {item.targetLanguages.map((lang: string) => lang.toUpperCase()).join(', ')}
      </Typography>
    </Td>
    <Td>
      <Typography textColor="neutral800">{formatDate(item['time-imported'])}</Typography>
    </Td>
  </Tr>
);

const HistoryMenu = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    field: 'project-name',
    direction: 'asc',
  });

  const { get } = getFetchClient();

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await get('/translationstudio/history');
        const result = handleHistoryResponse(response.data);

        if (result.isError) {
          setError(result.errorMessage || 'Failed to fetch translation history.');
        } else {
          setHistoryData(result.historyData);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setError('Failed to fetch translation history.');
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [setIsLoading, setError, setHistoryData ]);

  const processedData = useMemo(() => {
    const grouped = groupHistoryData(historyData);
    const filtered = filterBySearchTerm(grouped, debouncedSearchTerm, getSearchableText);

    return sortItems(filtered, sortState);
  }, [historyData, debouncedSearchTerm, sortState]);

  const handleSort = (field: SortField) => {
    setSortState((currentState) => getNextSortState(currentState, field));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  const hasData = processedData.length > 0;
  const hasSearchTerm = Boolean(debouncedSearchTerm.trim());

  return (
    <Box paddingTop={4} paddingBottom={4} style={{ width: '100%' }}>
      {!hasData && !hasSearchTerm ? (
        <EmptyState hasSearchTerm={false} />
      ) : (
        <>
          {historyData.length > 10 && <SearchInput value={searchTerm} onChange={handleSearchChange} />}

          {hasData ? (
            <HistoryTable data={processedData} sortState={sortState} onSort={handleSort} />
          ) : (
            <EmptyState hasSearchTerm={true} />
          )}
        </>
      )}
    </Box>
  );
};

export { HistoryMenu };
