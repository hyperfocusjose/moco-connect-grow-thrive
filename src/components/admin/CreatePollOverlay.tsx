
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreatePollOverlayProps {
  open: boolean;
  onClose: () => void;
}

const PollForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <div className="p-6">
    <h2 className="text-lg font-semibold mb-2">Create a New Poll</h2>
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        onComplete();
      }}
    >
      <input className="w-full border rounded px-2 py-1" placeholder="Poll question" required />
      <input className="w-full border rounded px-2 py-1" placeholder="Option 1" required />
      <input className="w-full border rounded px-2 py-1" placeholder="Option 2" required />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onComplete}>Cancel</Button>
        <Button type="submit" className="bg-maroon hover:bg-maroon/90">Create Poll</Button>
      </div>
    </form>
  </div>
);

export const CreatePollOverlay: React.FC<CreatePollOverlayProps> = ({
  open, onClose
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg p-0" onInteractOutside={e => e.preventDefault()}>
      <PollForm onComplete={onClose} />
    </DialogContent>
  </Dialog>
);
