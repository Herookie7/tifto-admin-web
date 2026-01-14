'use client';
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '@/lib/api/graphql/mutations/user';
import { useTranslations } from 'next-intl';
import { Toast } from 'primereact/toast';

interface ResetPasswordDialogProps {
    visible: boolean;
    onHide: () => void;
    userEmail: string;
    userName: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
    visible,
    onHide,
    userEmail,
    userName,
}) => {
    const t = useTranslations();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const toastRef = React.useRef<Toast>(null);

    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
        onCompleted: () => {
            toastRef.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: `Password successfully reset for ${userName}`,
                life: 3000,
            });
            handleClose();
        },
        onError: (error) => {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to reset password',
                life: 5000,
            });
        },
    });

    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setValidationError('');
        onHide();
    };

    const validateAndSubmit = () => {
        setValidationError('');

        if (!password || password.trim().length === 0) {
            setValidationError('Password is required');
            return;
        }

        if (password.length < 6) {
            setValidationError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        resetPassword({
            variables: {
                password: password,
                email: userEmail,
            },
        });
    };

    const footer = (
        <div>
            <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={handleClose}
                className="p-button-text"
                disabled={loading}
            />
            <Button
                label="Reset Password"
                icon="pi pi-check"
                onClick={validateAndSubmit}
                loading={loading}
                className="p-button-danger"
                autoFocus
            />
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} />
            <Dialog
                header={`Reset Password for ${userName}`}
                visible={visible}
                style={{ width: '450px' }}
                onHide={handleClose}
                footer={footer}
                modal
                draggable={false}
            >
                <div className="flex flex-col gap-4 p-2">
                    <p className="text-sm text-gray-600">
                        Enter a new password for <strong>{userEmail}</strong>
                    </p>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="new-password" className="font-semibold">
                            New Password
                        </label>
                        <Password
                            id="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            toggleMask
                            className="w-full"
                            inputClassName="w-full"
                            feedback={false}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirm-password" className="font-semibold">
                            Confirm Password
                        </label>
                        <Password
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            toggleMask
                            className="w-full"
                            inputClassName="w-full"
                            feedback={false}
                            disabled={loading}
                        />
                    </div>

                    {validationError && (
                        <div className="text-red-500 text-sm mt-2">
                            <i className="pi pi-exclamation-triangle mr-2"></i>
                            {validationError}
                        </div>
                    )}

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2">
                        <p className="text-sm text-yellow-700">
                            <i className="pi pi-info-circle mr-2"></i>
                            This action will reset the user's password. The user will need to use the new password to log in.
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
};
