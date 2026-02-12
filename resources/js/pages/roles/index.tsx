import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    group: string | null;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

interface PermissionsGrouped {
    [key: string]: Permission[];
}

interface Props {
    roles: Role[];
    permissions: PermissionsGrouped;
}

export default function RolesIndex({ roles, permissions }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletePopoverId, setDeletePopoverId] = useState<number | null>(null);

    // Create role form
    const createForm = useForm({
        name: '',
        display_name: '',
        description: '',
        permissions: [] as number[],
    });

    // Edit role form
    const editForm = useForm({
        name: '',
        display_name: '',
        description: '',
        permissions: [] as number[],
    });

    // Handle create role
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/roles', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Handle edit role
    const handleEdit = (role: Role) => {
        setEditingRole(role);
        editForm.setData({
            name: role.name,
            display_name: role.display_name,
            description: role.description || '',
            permissions: role.permissions.map((p) => p.id),
        });
        setIsEditOpen(true);
    };

    // Handle update role
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;

        editForm.put(`/roles/${editingRole.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingRole(null);
                editForm.reset();
            },
        });
    };

    // Handle delete role
    const handleDelete = (roleId: number) => {
        router.delete(`/roles/${roleId}`, {
            onSuccess: () => setDeletePopoverId(null),
        });
    };

    // Toggle permission in create form
    const toggleCreatePermission = (permissionId: number) => {
        const current = createForm.data.permissions;
        if (current.includes(permissionId)) {
            createForm.setData('permissions', current.filter((id) => id !== permissionId));
        } else {
            createForm.setData('permissions', [...current, permissionId]);
        }
    };

    // Toggle permission in edit form
    const toggleEditPermission = (permissionId: number) => {
        const current = editForm.data.permissions;
        if (current.includes(permissionId)) {
            editForm.setData('permissions', current.filter((id) => id !== permissionId));
        } else {
            editForm.setData('permissions', [...current, permissionId]);
        }
    };

    // Count permissions for a role
    const getPermissionCount = (role: Role) => {
        return role.permissions.length;
    };

    return (
        <>
            <Head title="Roles" />
            <AppHeader
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Roles', href: '/roles' },
                ]}
            />

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                            <p className="text-muted-foreground">
                                Manage system roles and their permissions
                            </p>
                        </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Create New Role</DialogTitle>
                                    <DialogDescription>
                                        Create a new role and assign permissions
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-name">Role Name (System)</Label>
                                        <Input
                                            id="create-name"
                                            placeholder="e.g., coordinator"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create-display-name">Display Name</Label>
                                        <Input
                                            id="create-display-name"
                                            placeholder="e.g., Program Coordinator"
                                            value={createForm.data.display_name}
                                            onChange={(e) => createForm.setData('display_name', e.target.value)}
                                            required
                                        />
                                        {createForm.errors.display_name && (
                                            <p className="text-sm text-destructive">{createForm.errors.display_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create-description">Description</Label>
                                        <Textarea
                                            id="create-description"
                                            placeholder="Brief description of this role"
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Permissions</Label>
                                        {createForm.errors.permissions && (
                                            <p className="text-sm text-destructive">{createForm.errors.permissions}</p>
                                        )}
                                        {Object.entries(permissions).map(([group, groupPermissions]) => (
                                            <div key={group} className="space-y-2">
                                                <h4 className="font-semibold capitalize text-sm">{group || 'Other'}</h4>
                                                <div className="space-y-2 pl-4 border-l-2">
                                                    {groupPermissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-start space-x-2">
                                                            <Checkbox
                                                                id={`create-perm-${permission.id}`}
                                                                checked={createForm.data.permissions.includes(permission.id)}
                                                                onCheckedChange={() => toggleCreatePermission(permission.id)}
                                                            />
                                                            <div className="flex-1">
                                                                <Label
                                                                    htmlFor={`create-perm-${permission.id}`}
                                                                    className="text-sm font-medium cursor-pointer"
                                                                >
                                                                    {permission.display_name}
                                                                </Label>
                                                                {permission.description && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {permission.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating...' : 'Create Role'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    </div>

                    {/* Roles Table */}
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{role.display_name}</div>
                                                <div className="text-xs text-muted-foreground">{role.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {role.description || 'No description'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {getPermissionCount(role)} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Popover
                                                open={deletePopoverId === role.id}
                                                onOpenChange={(open) =>
                                                    setDeletePopoverId(open ? role.id : null)
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold">Delete Role</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Are you sure you want to delete the role "{role.display_name}"?
                                                            This action cannot be undone.
                                                        </p>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeletePopoverId(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(role.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>
                                Update role details and permissions
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Role Name (System)</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-destructive">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-display-name">Display Name</Label>
                                <Input
                                    id="edit-display-name"
                                    value={editForm.data.display_name}
                                    onChange={(e) => editForm.setData('display_name', e.target.value)}
                                    required
                                />
                                {editForm.errors.display_name && (
                                    <p className="text-sm text-destructive">{editForm.errors.display_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                {editForm.errors.permissions && (
                                    <p className="text-sm text-destructive">{editForm.errors.permissions}</p>
                                )}
                                {Object.entries(permissions).map(([group, groupPermissions]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="font-semibold capitalize text-sm">{group || 'Other'}</h4>
                                        <div className="space-y-2 pl-4 border-l-2">
                                            {groupPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-start space-x-2">
                                                    <Checkbox
                                                        id={`edit-perm-${permission.id}`}
                                                        checked={editForm.data.permissions.includes(permission.id)}
                                                        onCheckedChange={() => toggleEditPermission(permission.id)}
                                                    />
                                                    <div className="flex-1">
                                                        <Label
                                                            htmlFor={`edit-perm-${permission.id}`}
                                                            className="text-sm font-medium cursor-pointer"
                                                        >
                                                            {permission.display_name}
                                                        </Label>
                                                        {permission.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
