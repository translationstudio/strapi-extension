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
import { Bell, More } from '@strapi/icons';
import { SimpleMenu } from '@strapi/design-system';
import { MenuItem } from '@strapi/design-system';
import { IconButton } from '@strapi/design-system';
import DeleteHistoryEntryRequest from './DeleteHistoryEntryRequest';
import { GetStatusColor, GetStatusText } from './utils/historyStatusUtils';
import { getThemeColors } from './utils/theme';
import { Alert } from '@strapi/design-system';

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
    onDelete,
    secondaryColor
}: {
    data: GroupedHistoryItem[];
    sortState: SortState;
    onSort: (field: SortField) => void;
    onDelete: (item: GroupedHistoryItem) => void;
    secondaryColor: string;
}) => (
    <Box
        style={{
            borderRadius: '4px',
        }}
    >
        <Table colCount={6} rowCount={data.length + 1}>
            <Thead>
                <Tr>
                    <SortableHeader field="element-name" currentSort={sortState} onSort={onSort}>
                        Entry
                    </SortableHeader>
                    <SortableHeader field="project-name" currentSort={sortState} onSort={onSort}>
                        Content Type
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
                    <Th />
                </Tr>
            </Thead>
            <Tbody>
                {data.map((item, index) => (
                    <HistoryRow
                        key={`${item['element-uid']}-${index}`}
                        item={item}
                        onDelete={onDelete}
                        secondaryColor={secondaryColor}
                    />
                ))}
            </Tbody>
        </Table>
    </Box>
);

const getContentType = function(input:string)
{
    const left = input.indexOf('.');
    const right = input.lastIndexOf("#");
    if (left === -1 || left > right || right === -1)
        return "-";

    return input.substring(left+1, right);
}
const getElementId = function(input:string)
{
    const right = input.lastIndexOf("#");
    if (right === -1)
        return "-";

    return input.substring(right+1);
}

const HistoryRow = ({ item, onDelete, secondaryColor }: { item: GroupedHistoryItem, onDelete: (item: GroupedHistoryItem) => void, secondaryColor:string }) => (
    <Tr>
        <Td>
            <p><Typography variant="omega">{item['element-name']}</Typography></p>
            <Typography variant="omega" style={{ fontFamily: 'monospace', fontSize: '12px', color: secondaryColor }}>
                {getElementId(item['element-uid'])}
            </Typography>
        </Td>
        <Td>
            <Typography variant="omega">{getContentType(item['element-uid'])}</Typography>
        </Td>
        <Td>
            <Badge variant={GetStatusColor(item.status)}>{GetStatusText(item.status)}</Badge>
        </Td>
        <Td>
            <Typography variant="omega">
                {item.targetLanguage.toUpperCase()}
            </Typography>
        </Td>
        <Td>
            <Typography textColor="neutral800">{formatDate(item.timeUpdated)}</Typography>
        </Td>
        <Td>
            <SimpleMenu label="Actions" tag={IconButton} icon={<More />}>
                <MenuItem startIcon={<Bell />} variant="danger" onSelect={() => onDelete(item)}>
                    Delete history entry
                </MenuItem>
            </SimpleMenu>
        </Td>
    </Tr>
);

const HistoryMenu = () => {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [succcessMessage, setSucccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteItem, setDeleteItem] = useState<GroupedHistoryItem|null>(null);
    const [sortState, setSortState] = useState<SortState>({
        field: 'time-imported',
        direction: 'desc',
    });

    const { get, post } = getFetchClient();
    const themeColors = getThemeColors();

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
                } else if (result.historyData && Array.isArray(result.historyData) && result.historyData.length > 0) {
                    const res:HistoryItem[] = result.historyData;
                    res.sort((a,b) => a['time-updated'] - b['time-updated'])
                    setHistoryData(res);
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
    }, [setIsLoading, setError, setHistoryData]);

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

    const removeHistoryEntry = function(item: GroupedHistoryItem)
    {
        if (!item || historyData.length === 0)
            return;

        if (historyData.length === 1)
        {
            setHistoryData([]);
            return;
        }

        let index = -1;
        for (let i = 0; i < historyData.length && index === -1; i++)
        {
            if (historyData[i].id === item.id)
                index = i;
        }

        if (index === -1)
            return;

        historyData.splice(index, 1);
        setHistoryData([...historyData]);
    }

    const onDeleteHistoyInfo = function (elem: GroupedHistoryItem) {

        if (!errorMessage)
            setErrorMessage("");
        if (!succcessMessage)
            setSucccessMessage("");

        if (!deleteItem)
            return;
                
        post('/translationstudio/history', {
            uid: deleteItem.id
        }).then(res => {
            if (res.status !== 204)
                throw new Error("Could not delete entry");

            removeHistoryEntry(deleteItem);
            setSucccessMessage("Successfully removed history entry.");
        })
        .catch(() => setErrorMessage("Could not delete history entry " + deleteItem['element-name']))
        .finally(() => setDeleteItem(null))
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
                    {errorMessage && <Alert title={errorMessage}  variant="danger" style={{ marginBottom: "2em"}} >{errorMessage}</Alert>}
                    {succcessMessage && <Alert title={succcessMessage} variant="success" style={{ marginBottom: "2em"}} >{succcessMessage}</Alert>}
                    {hasData ? (
                        <>
                        {deleteItem && <DeleteHistoryEntryRequest item={deleteItem} onClose={() => setDeleteItem(null) }  onDeleted={onDeleteHistoyInfo}/>}
                        <HistoryTable data={processedData} sortState={sortState} onSort={handleSort} onDelete={setDeleteItem} secondaryColor={themeColors.secondaryText} />
                        </>
                    ) : (
                        <EmptyState hasSearchTerm={true} />
                    )}
                </>
            )}
        </Box>
    );
};

export { HistoryMenu };
