import { FC, useState } from 'react';

import { Check, Copy } from 'lucide-react';

import { Button, Input } from '@family-budget/ui';

import { useCreateFamily } from '../../contexts/family-context';

export const InviteStep: FC = () => {
    const { family } = useCreateFamily();
    const [copied, setCopied] = useState(false);

    if (!family) {
        return;
    }

    const inviteLink = `${window.location.origin}/accept-invite/${family.invitationCode}`;

    async function handleCopy() {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="flex items-center gap-2">
            <Input readOnly value={inviteLink} className="font-mono" />
            <Button type="button" variant="secondary" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
            </Button>
        </div>
    );
};
