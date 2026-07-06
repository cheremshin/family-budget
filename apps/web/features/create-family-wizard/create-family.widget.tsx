'use client';

import { Button, buttonVariants, cn, Dialog, DialogContent } from '@ui/index';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';
import { CreateFamilyWizard } from './components/create-family-wizard';

export const CreateFamilyWidget: FC = () => {
    const [mode, setMode] = useState<'welcome' | 'create'>('welcome');

    return (
        <Dialog defaultOpen>
            <DialogContent className="p-10" disableUserClose hideClose>
                {mode === 'welcome' ? (
                    <>
                        <div className="h-64">
                            <h1 className="text-4xl font-extrabold">
                                Добро пожаловать
                            </h1>
                            <p className="mt-5">
                                Чтобы начать, необходимо создать семью или
                                присоединиться к существующей.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full cursor-pointer"
                                onClick={() => setMode('create')}
                            >
                                Начать создание
                                <ArrowRight />
                            </Button>
                            <Link
                                href="/accept-invite"
                                className={cn(
                                    buttonVariants({
                                        variant: 'secondary',
                                    }),
                                    'w-full',
                                )}
                            >
                                Ввести код-приглашение
                            </Link>
                        </div>
                    </>
                ) : (
                    <CreateFamilyWizard onExit={() => setMode('welcome')} />
                )}
            </DialogContent>
        </Dialog>
    );
};
