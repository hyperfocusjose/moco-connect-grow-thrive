
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MemberForm } from "@/components/forms/MemberForm";

interface AddMemberOverlayProps {
  open: boolean;
  onClose: () => void;
}
export const AddMemberOverlay: React.FC<AddMemberOverlayProps> = ({
  open,
  onClose
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg p-0" onInteractOutside={e => e.preventDefault()}>
      <MemberForm onComplete={onClose} />
    </DialogContent>
  </Dialog>
);
