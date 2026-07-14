import { FamilyMember } from '@/lib/family';
import { getFirstCharacter } from '@/lib/utils/get-first-character';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/index';
import { FC } from 'react';

type PropsT = {
    ownerId: string;
    members: FamilyMember[];
    maxMembers: number;
};

export const FamilyMembers: FC<PropsT> = ({ ownerId, members, maxMembers }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Участники семьи</CardTitle>
                <CardDescription>{`В семье ${members.length}/${maxMembers} участников`}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex gap-4 items-center bg-accent p-4 border-border border rounded-xl"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                            {getFirstCharacter(member.username)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">{member.username}</span>
                            <span className="bg-background text-accent-foreground text-xs p-1 text-center border-border border rounded-xl">
                                {member.id === ownerId ? 'Создатель' : 'Участник'}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
