'use client';
import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/useable-components/shadcn/ui/card';
import { Button } from '@/lib/ui/useable-components/shadcn/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/ui/useable-components/shadcn/ui/table';
import { Badge } from '@/lib/ui/useable-components/shadcn/ui/badge';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

// GraphQL Queries
const GET_FRANCHISES = gql`
  query GetFranchises {
    franchises {
      _id
      name
      city
      area
      isActive
      owner {
        _id
        name
        email
      }
      contactPerson {
        name
        email
        phone
      }
      startDate
      endDate
      createdAt
    }
  }
`;

interface Franchise {
    _id: string;
    name: string;
    city: string;
    area?: string;
    isActive: boolean;
    owner?: {
        _id: string;
        name: string;
        email: string;
    };
    contactPerson?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

export default function FranchiseScreen() {
    const { loading, error, data, refetch } = useQuery(GET_FRANCHISES);
    const [showAddForm, setShowAddForm] = useState(false);

    const franchises: Franchise[] = data?.franchises || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Error loading franchises: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Franchise Management</CardTitle>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Franchise
                    </Button>
                </CardHeader>
                <CardContent>
                    {franchises.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No franchises found. Click "Add Franchise" to create one.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Area</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {franchises.map((franchise) => (
                                    <TableRow key={franchise._id}>
                                        <TableCell className="font-medium">{franchise.name}</TableCell>
                                        <TableCell>{franchise.city}</TableCell>
                                        <TableCell>{franchise.area || '-'}</TableCell>
                                        <TableCell>
                                            {franchise.owner?.name || '-'}
                                            {franchise.owner?.email && (
                                                <span className="block text-sm text-gray-500">{franchise.owner.email}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {franchise.contactPerson?.name || '-'}
                                            {franchise.contactPerson?.phone && (
                                                <span className="block text-sm text-gray-500">{franchise.contactPerson.phone}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={franchise.isActive ? 'default' : 'secondary'}>
                                                {franchise.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
