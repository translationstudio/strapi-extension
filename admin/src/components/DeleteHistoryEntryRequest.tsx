
import { Modal, Button } from "@strapi/design-system";
import { Typography } from "@strapi/design-system";
import { Trash } from "@strapi/icons";
import { GroupedHistoryItem } from "../../../Types";


export default function DeleteHistoryEntryRequest({ item, onDeleted, onClose }: { item:GroupedHistoryItem, onClose:() => void, onDeleted:(item:GroupedHistoryItem) => void }) {

    return <Modal.Root open={true} onOpenChange={() => onClose()}>
        <Modal.Content>
            <Modal.Header>
                <Modal.Title>Delete translation history information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><Typography variant="beta">Really delete this enty?</Typography></p>
                <p><Typography>This cannot be undone. You can always translate the entry again.</Typography></p>
                <p>&nbsp;</p>
                <p><Typography>Name: {item["element-name"]}
                    <br/>Status: {item.status}
                    <br/>Language: {item.targetLanguage}</Typography>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} variant="tertiary">Cancel</Button>
                <Button onClick={onDeleted} startIcon={<Trash />}>Delete</Button>
            </Modal.Footer>
        </Modal.Content>
    </Modal.Root>
}
