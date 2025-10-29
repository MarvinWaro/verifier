import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Shield, User } from 'lucide-react';

interface Graduate {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    extensionName: string | null;
    yearGraduated: string;
    studentId: string;
    eligibility: string;
    dateOfBirth: string | null;
    sex: string | null;
    soNumber: string | null;
    lrn: string | null;
    philsysId: string | null;
    program?: {
        id: number;
        name: string;
        major: string | null;
        copNumber: string | null;
        grNumber: string | null;
    };
    institution?: {
        code: string;
        name: string;
        type: string;
    };
}

interface GraduateViewModalProps {
    graduate: Graduate | null;
    onClose: () => void;
}

export default function GraduateViewModal({
    graduate,
    onClose,
}: GraduateViewModalProps) {
    return (
        <Dialog open={!!graduate} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Graduate Verification Details
                    </DialogTitle>
                </DialogHeader>

                {graduate && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                                <User className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {graduate.name}
                            </h3>
                            <Badge
                                className={
                                    graduate.eligibility === 'Eligible'
                                        ? 'mt-2 border-0 bg-green-100 text-green-800'
                                        : 'mt-2 border-0 bg-red-100 text-red-800'
                                }
                            >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                {graduate.eligibility}
                            </Badge>
                        </div>

                        <div className="grid gap-6">
                            <Card className="border-gray-200">
                                <CardContent className="p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                        Personal Information
                                    </h4>
                                    <div className="grid gap-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Full Name
                                            </span>
                                            <span className="text-sm font-medium">
                                                {graduate.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Student ID
                                            </span>
                                            <span className="font-mono text-sm font-medium">
                                                {graduate.studentId}
                                            </span>
                                        </div>
                                        {graduate.dateOfBirth && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Date of Birth
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {graduate.dateOfBirth}
                                                </span>
                                            </div>
                                        )}
                                        {graduate.sex && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Sex
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {graduate.sex}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Year Graduated
                                            </span>
                                            <span className="text-sm font-medium">
                                                {graduate.yearGraduated}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200">
                                <CardContent className="p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                        Academic Information
                                    </h4>
                                    <div className="grid gap-3">
                                        {graduate.program && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Program
                                                    </span>
                                                    <span className="text-right text-sm font-medium">
                                                        {graduate.program.name}
                                                    </span>
                                                </div>
                                                {graduate.program.major && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">
                                                            Major
                                                        </span>
                                                        <span className="text-right text-sm font-medium">
                                                            {
                                                                graduate.program
                                                                    .major
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {graduate.institution && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Institution
                                                    </span>
                                                    <span className="text-right text-sm font-medium">
                                                        {
                                                            graduate.institution
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Institution Code
                                                    </span>
                                                    <span className="font-mono text-sm font-medium">
                                                        {
                                                            graduate.institution
                                                                .code
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Institution Type
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            graduate.institution
                                                                .type ===
                                                            'public'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {graduate.institution
                                                            .type === 'public'
                                                            ? 'Public'
                                                            : 'Private'}
                                                    </Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200">
                                <CardContent className="p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                        Certification Details
                                    </h4>
                                    <div className="grid gap-3">
                                        {graduate.program?.copNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    COPC Number
                                                </span>
                                                <span className="font-mono text-sm font-medium text-green-600">
                                                    {graduate.program.copNumber}
                                                </span>
                                            </div>
                                        )}
                                        {graduate.program?.grNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    GR Number
                                                </span>
                                                <span className="font-mono text-sm font-medium text-purple-600">
                                                    {graduate.program.grNumber}
                                                </span>
                                            </div>
                                        )}
                                        {graduate.soNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    SO Number
                                                </span>
                                                <span className="font-mono text-sm font-medium">
                                                    {graduate.soNumber}
                                                </span>
                                            </div>
                                        )}
                                        {graduate.lrn && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    LRN
                                                </span>
                                                <span className="font-mono text-sm font-medium">
                                                    {graduate.lrn}
                                                </span>
                                            </div>
                                        )}
                                        {graduate.philsysId && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    PhilSys ID
                                                </span>
                                                <span className="font-mono text-sm font-medium">
                                                    {graduate.philsysId}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Eligibility Status
                                            </span>
                                            <Badge
                                                className={
                                                    graduate.eligibility ===
                                                    'Eligible'
                                                        ? 'border-0 bg-green-100 text-xs text-green-800'
                                                        : 'border-0 bg-red-100 text-xs text-red-800'
                                                }
                                            >
                                                {graduate.eligibility}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                    <div className="text-sm text-blue-900">
                                        <p className="mb-1 font-semibold">
                                            Verification Notice
                                        </p>
                                        <p>
                                            This information is verified from
                                            CHED's official records and is valid
                                            for PRC board examination eligibility
                                            verification.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
