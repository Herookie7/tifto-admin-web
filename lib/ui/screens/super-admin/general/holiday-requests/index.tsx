'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Table from '@/lib/ui/useable-components/table';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';

const GET_HOLIDAY_REQUESTS = gql`
  query GetHolidayRequests($status: String) {
    getHolidayRequests(status: $status) {
      _id
      startDate
      endDate
      reason
      status
      createdAt
      rejectionReason
      riderId {
        _id
        name
        phone
      }
      approvedBy {
        name
      }
    }
  }
`;

const UPDATE_HOLIDAY_REQUEST_STATUS = gql`
  mutation UpdateHolidayRequestStatus($requestId: String!, $status: String!, $rejectionReason: String) {
    updateHolidayRequestStatus(requestId: $requestId, status: $status, rejectionReason: $rejectionReason) {
      _id
      status
    }
  }
`;

export default function HolidayRequestsScreen() {
    const t = useTranslations();
    const [statusFilter, setStatusFilter] = useState(''); // '' for All

    const { data, loading, refetch } = useQuery(GET_HOLIDAY_REQUESTS, {
        variables: { status: statusFilter || undefined },
        fetchPolicy: 'network-only'
    });

    const [updateStatus, { loading: updating }] = useMutation(UPDATE_HOLIDAY_REQUEST_STATUS, {
        onCompleted: () => refetch(),
        onError: (err) => console.error(err)
    });

    const handleAction = (requestId: string, status: string, rejectionReason?: string) => {
        if (status === 'REJECTED' && !rejectionReason) {
            // TODO: Prompt for reason. For now, hardcode or empty.
            // In a real app, show a dialog.
            const reason = prompt(t("Enter rejection reason:"));
            if (reason === null) return; // Cancel
            rejectionReason = reason;
        }
        updateStatus({ variables: { requestId, status, rejectionReason } });
    };

    const statusBodyTemplate = (rowData: any) => {
        let severity = null;
        switch (rowData.status) {
            case 'APPROVED': severity = 'success'; break;
            case 'REJECTED': severity = 'danger'; break;
            case 'PENDING': severity = 'warning'; break;
            case 'CANCELLED': severity = 'info'; break;
        }
        return <Tag value={rowData.status} severity={severity} />;
    };

    const actionBodyTemplate = (rowData: any) => {
        if (rowData.status !== 'PENDING') return null;

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-check"
                    className="p-button-rounded p-button-success p-button-text"
                    tooltip="Approve"
                    onClick={() => handleAction(rowData._id, 'APPROVED')}
                    disabled={updating}
                />
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-text"
                    tooltip="Reject"
                    onClick={() => handleAction(rowData._id, 'REJECTED')}
                    disabled={updating}
                />
            </div>
        );
    };

    const riderBodyTemplate = (rowData: any) => {
        return (
            <div className="flex flex-col">
                <span className="font-bold">{rowData.riderId?.name || 'Unknown'}</span>
                <span className="text-xs text-gray-500">{rowData.riderId?.phone}</span>
            </div>
        );
    };

    const dateBodyTemplate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const columns = [
        { headerName: t('Rider'), propertyName: 'riderId', body: riderBodyTemplate },
        { headerName: t('Start Date'), propertyName: 'startDate', body: (row: any) => dateBodyTemplate(row.startDate) },
        { headerName: t('End Date'), propertyName: 'endDate', body: (row: any) => dateBodyTemplate(row.endDate) },
        { headerName: t('Reason'), propertyName: 'reason' },
        { headerName: t('Status'), propertyName: 'status', body: statusBodyTemplate },
        { headerName: t('Action'), propertyName: 'action', body: actionBodyTemplate },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('Holiday Requests')}</h1>
                <Button icon="pi pi-refresh" onClick={() => refetch()} />
            </div>

            <Table
                columns={columns}
                data={data?.getHolidayRequests || []}
                loading={loading}
                rowsPerPage={10}
                moduleName="Holiday-Requests"
            />
        </div>
    );
}
