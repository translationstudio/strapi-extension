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
    Checkbox,
} from '@strapi/design-system';
import { useState, useEffect, useMemo } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';
import BulkTranslationPanel from './BulkTranslationPanel';
import { ContentType, BulkTranslationMenuProps, Entry, GroupedHistoryItem } from '../../../Types';
import { filterAndTransformContentTypes } from './utils/filterAndTransformContentTypes';
import { getEntryTitle, getEntryId } from './utils/getEntryHelper';
import { getThemeColors } from './utils/theme';
import { Button } from '@strapi/design-system';
import { Earth } from '@strapi/icons';

const ContentTypesList = ({
    contentTypes,
    isLoading,
    selectedContentType,
    onContentTypeClick,
    themeColors,
}: {
    contentTypes: ContentType[];
    isLoading: boolean;
    selectedContentType: string;
    onContentTypeClick: (uid: string) => void;
    themeColors: ReturnType<typeof getThemeColors>;
}) => (
    <Box style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography
            variant="omega"
            paddingBottom={3}
            style={{ fontWeight: 'bold', color: themeColors.primaryText }}
        >
            Content Types
        </Typography>
        <Box style={{ paddingTop: '8px', paddingBottom: '8px' }}>
            {isLoading ? (
                <Box padding={2}>
                    <Typography variant="omega" style={{ color: themeColors.primaryText }}>
                        Loading...
                    </Typography>
                </Box>
            ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {contentTypes.map((type) => (
                        <ContentTypeItem
                            key={type.uid}
                            type={type}
                            isSelected={selectedContentType === type.uid}
                            onClick={() => onContentTypeClick(type.uid)}
                            themeColors={themeColors}
                        />
                    ))}
                </Box>
            )}
        </Box>
    </Box>
);

const ContentTypeItem = ({
    type,
    isSelected,
    onClick,
    themeColors,
}: {
    type: ContentType;
    isSelected: boolean;
    onClick: () => void;
    themeColors: ReturnType<typeof getThemeColors>;
}) => (
    <Box
        style={{
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: themeColors.cardBackground,
            border: isSelected ? '1px solid #7b79ff' : '1px solid transparent',
            transition: 'all 0.2s ease',
        }}
        onClick={onClick}
    >
        <Typography
            variant="omega"
            style={{
                fontWeight: isSelected ? 'bold' : 'normal',
                color: isSelected ? '#7b79ff' : themeColors.primaryText,
            }}
        >
            {type.displayName}
        </Typography>
        <Box paddingTop={1}>
            <Typography variant="pi" style={{ color: themeColors.mutedText, fontSize: '11px' }}>
                {type.kind}
            </Typography>
        </Box>
    </Box>
);

const EntriesTable = ({
    entries,
    isLoading,
    selectedEntries,
    historyData,
    isLoadingHistory,
    onEntrySelection,
    onSelectAll,
    themeColors,
}: {
    entries: Entry[];
    isLoading: boolean;
    selectedEntries: Set<string>;
    historyData: HistoryDataLanguageMap;
    isLoadingHistory: boolean;
    onEntrySelection: (entryId: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    themeColors: ReturnType<typeof getThemeColors>;
}) => {
    if (isLoading) {
        return (
            <Box
                style={{
                    borderRadius: '4px',
                    padding: '16px',
                    backgroundColor: themeColors.cardBackground,
                }}
            >
                <Typography variant="omega" style={{ color: themeColors.secondaryText }}>
                    Loading entries...
                </Typography>
            </Box>
        );
    }

    if (entries.length === 0) {
        return (
            <Box
                style={{
                    borderRadius: '4px',
                    padding: '16px',
                    backgroundColor: themeColors.cardBackground,
                }}
            >
                <Typography variant="omega" style={{ color: themeColors.mutedText }}>
                    No entries found for this content type.
                </Typography>
            </Box>
        );
    }

    const hasSelectedAll = selectedEntries.size === entries.length && entries.length > 0;
    const checkedType = hasSelectedAll || selectedEntries.size === 0 ? hasSelectedAll : "indeterminate"

    return (
        <Box
            style={{
                borderRadius: '4px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'fit-content',
                backgroundColor: themeColors.cardBackground,
            }}
        >
            <Table colCount={5}>
                <Thead>
                    <Tr>
                        <Th style={{ width: '50px' }}>
                            <Checkbox checked={checkedType} onCheckedChange={onSelectAll} />
                        </Th>
                        <Th>
                            <Typography variant="sigma" fontWeight="bold" style={{ color: themeColors.primaryText }}>
                                Title
                            </Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma" fontWeight="bold" style={{ color: themeColors.primaryText }}>
                                Translated
                            </Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma" fontWeight="bold" style={{ color: themeColors.primaryText }}>
                                In translation
                            </Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma" fontWeight="bold" style={{ color: themeColors.primaryText }}>
                                Queued
                            </Typography>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {entries.map((entry) => (
                        <EntryRow
                            key={getEntryId(entry)}
                            entry={entry}
                            isSelected={selectedEntries.has(getEntryId(entry))}
                            historyData={historyData}
                            isLoadingHistory={isLoadingHistory}
                            onEntrySelection={onEntrySelection}
                            themeColors={themeColors}
                        />
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

const getLangQueued = function (e:HistoryDataLanguageMapItem) {
    return e.queued.sort().join(", ");
}
const getLangInTranslation = function (e:HistoryDataLanguageMapItem) {
    return e.intranslation.sort().join(", ");
}
const getLangTranslated = function (e:HistoryDataLanguageMapItem) {
    return e.translated.sort().join(", ");
}

type HistoryDataLanguageMapItem = {
    queued: string[];
    intranslation: string[];
    translated: string[];
}

type HistoryDataLanguageMap = {
    [id:string]: HistoryDataLanguageMapItem
}

const EmptyHistoryDataLanguageMapItem:HistoryDataLanguageMapItem = {
    queued: [],
    intranslation: [],
    translated: []
}
const EntryRow = ({
    entry,
    isSelected,
    historyData,
    isLoadingHistory,
    onEntrySelection,
    themeColors,
}: {
    entry: Entry;
    isSelected: boolean;
    historyData: HistoryDataLanguageMap;
    isLoadingHistory: boolean;
    onEntrySelection: (entryId: string, isSelected: boolean) => void;
    themeColors: ReturnType<typeof getThemeColors>;
}) => {
    const entryId = getEntryId(entry);
    const history = historyData[entryId] ?? EmptyHistoryDataLanguageMapItem;

    return (
        <Tr>
            <Td>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: any) => onEntrySelection(entryId, checked)}
                />
            </Td>
            <Td>
                <Typography variant="omega" style={{ color: themeColors.primaryText }}>
                    {getEntryTitle(entry)}
                </Typography>
                <br />
                <Typography variant="omega" style={{ fontFamily: 'monospace', fontSize: '12px', color: themeColors.secondaryText }} >
                    {entryId}
                </Typography>
            </Td>
            <Td>
                <Typography variant="omega" style={{ color: themeColors.primaryText }}>
                    {getLangTranslated(history)}
                </Typography>
            </Td>
            <Td>
                <Typography variant="omega" style={{ color: themeColors.primaryText }}>
                    {getLangInTranslation(history)}
                </Typography>
            </Td>
            <Td>
                <Typography variant="omega" style={{ color: themeColors.primaryText }}>
                    {getLangQueued(history)}
                </Typography>
            </Td>
        </Tr>
    );
};

const fetchContentEntriesData = async function (selectedContentType: string): Promise<Entry[]> {
    if (!selectedContentType) {
        return [];
    }

    try {
        const { get } = getFetchClient();
        const response = await get(`/content-manager/collection-types/${selectedContentType}`);
        if (response.data?.results && Array.isArray(response.data.results))
            return response.data.results;
    }
    catch (error) {
        console.error('Failed to fetch entries:', error);
    }

    return [];
}

const extractDocumentId = function(id:string)
{
    const pos = id.lastIndexOf("#");
    return pos === -1 ? id : id.substring(pos+1);
}

const groupHistory = function(history:GroupedHistoryItem[])
{
    const map:HistoryDataLanguageMap = {}

    for (const e of history)
    {
        const id = extractDocumentId(e['element-uid']);
        if (!map[id]) {
            const data:HistoryDataLanguageMapItem = {
                queued: [],
                intranslation: [],
                translated: []
            }
            map[id] = data;
        }

        const entry = map[id];

        switch(e.status)
        {
            case "intranslation":
                entry.intranslation.push(e.targetLanguage);
                break;
            case "translated":
                entry.translated.push(e.targetLanguage);
                break;
            default:
                entry.queued.push(e.targetLanguage);
            break;
        }
    }

    for (const key in map)
    {
        const data = map[key];
        data.intranslation.sort();
        data.queued.sort();
        data.translated.sort();
    }

    return map;
}

const BulkTranslationMenu = ({
    groupedHistoryData,
    isLoadingHistory,
    onTranslationComplete,
}: BulkTranslationMenuProps) => {
    const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
    const [selectedContentType, setSelectedContentType] = useState<string>('');
    const [entries, setEntries] = useState<Entry[]>([]);
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    const [isLoadingContentTypes, setIsLoadingContentTypes] = useState(false);
    const [isLoadingEntries, setIsLoadingEntries] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);

    const themeColors = getThemeColors();

    const historyItemMap = useMemo(() => groupHistory(groupedHistoryData), [groupedHistoryData])

    const { get } = getFetchClient();

    useEffect(() => {
        const fetchContentTypes = async () => {

            setIsLoadingContentTypes(true);
            try {
                const response = await get('/content-manager/content-types');
                const types = filterAndTransformContentTypes(response.data.data);
                setContentTypes(types);

                if (types.length > 0) {
                    setSelectedEntries(new Set());
                    setSelectedContentType(types[0].uid);
                    const data = await fetchContentEntriesData(types[0].uid);
                    setEntries(data);
                }
            }
            catch (error) {
                console.error('Failed to fetch content types:', error);
            }
            finally {
                setIsLoadingContentTypes(false);
            }
        };
        fetchContentTypes();
    }, [setIsLoadingContentTypes, setContentTypes, setSelectedContentType, setEntries, setSelectedEntries]);


    const fetchContentEntries = function (selectedContentType: string) {
        if (!selectedContentType) {
            return;
        }

        setIsLoadingEntries(true);

        fetchContentEntriesData(selectedContentType).then(data => {
            setEntries(data);
            setSelectedEntries(new Set());
        })
            .finally(() => setIsLoadingEntries(false));
    };

    const selectedContentTypeData = useMemo(
        () => contentTypes.find((ct) => ct.uid === selectedContentType),
        [contentTypes, selectedContentType]
    );

    const handleContentTypeClick = (contentTypeUid: string) => {
        if (selectedContentType === contentTypeUid)
            return;

        setSelectedContentType(contentTypeUid);
        fetchContentEntries(contentTypeUid);
    };

    const handleEntrySelection = (entryId: string, isSelected: boolean) => {
        const newSelection = new Set(selectedEntries);
        if (isSelected) {
            newSelection.add(entryId);
        } else {
            newSelection.delete(entryId);
        }
        setSelectedEntries(newSelection);
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedEntries(new Set(entries.map(getEntryId)));
        } else {
            setSelectedEntries(new Set());
        }
    };

    const handleTranslationComplete = () => {
        setSelectedEntries(new Set());
        onTranslationComplete?.();
    };

    if (contentTypes.length === 0) {
        return <Box paddingTop={4} paddingBottom={4} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="omega" paddingBottom={3} style={{ fontWeight: 'bold' }}>
                No content types available.
            </Typography>
        </Box>
    }

    return (
        <Box paddingTop={4} paddingBottom={4} style={{ display: 'flex', flexDirection: 'column' }}>
            <Box style={{ flex: 1, display: 'flex', gap: '16px' }}>
                <ContentTypesList
                    contentTypes={contentTypes}
                    isLoading={isLoadingContentTypes}
                    selectedContentType={selectedContentType}
                    onContentTypeClick={handleContentTypeClick}
                    themeColors={themeColors}
                />

                <Box
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="omega" paddingBottom={3} style={{ fontWeight: 'bold' }}>
                        Entries
                    </Typography>
                    {selectedContentType ? (
                        <EntriesTable
                            entries={entries}
                            isLoading={isLoadingEntries}
                            selectedEntries={selectedEntries}
                            historyData={historyItemMap}
                            isLoadingHistory={isLoadingHistory}
                            onEntrySelection={handleEntrySelection}
                            onSelectAll={handleSelectAll}
                            themeColors={themeColors}
                        />
                    ) : (
                        <Box style={{ borderRadius: '4px', padding: '16px' }}>
                            <Typography variant="omega" style={{ color: '#666' }}>
                                Select a content type to view entries.
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Button 
                    disabled={selectedEntries.size === 0}
                    style={{ position: "fixed", right: "5%", bottom: "5%" }} 
                    size="L"
                    startIcon={<Earth />}
                    onClick={() => {setShowTranslation(true) }}>
                        Translate {selectedEntries.size} {selectedEntries.size === 1 ? "entry" : "entries"}
                </Button>

                {showTranslation && (
                    <BulkTranslationPanel
                        contentType={selectedContentTypeData}
                        selectedEntries={Array.from(selectedEntries)}
                        onClose={() => setShowTranslation(false)}
                        onTranslationComplete={() => {
                            handleTranslationComplete();
                            setShowTranslation(false);
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export { BulkTranslationMenu };
