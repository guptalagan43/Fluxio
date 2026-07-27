// src/components/settings/DeleteDataModal.tsx
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDataModal({ isOpen, onClose, onConfirm }: DeleteDataModalProps): JSX.Element {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete All Account Data">
      <div className="space-y-4">
        <p className="text-sm text-stone-700 leading-relaxed">
          Are you sure you want to permanently delete your account and all synchronized usage data? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete My Account & Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
