import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, GraduationCap } from 'lucide-react';

interface Program {
    id: number;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number;
}

interface ProgramsListProps {
    programs: Program[];
    onProgramClick: (program: Program) => void;
}

export default function ProgramsList({
    programs,
    onProgramClick,
}: ProgramsListProps) {
    return (
        <>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Available Programs
            </h3>
            <div className="grid gap-4">
                {programs.map((program) => (
                    <Card
                        key={program.id}
                        className="cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                        onClick={() => onProgramClick(program)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-100 p-3">
                                        <GraduationCap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {program.name}
                                        </h4>
                                        {program.major && (
                                            <p className="text-sm text-gray-600">
                                                Major: {program.major}
                                            </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                            {program.copNumber && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-600">
                                                        COP:
                                                    </span>
                                                    <span className="font-mono text-green-600">
                                                        {program.copNumber}
                                                    </span>
                                                </div>
                                            )}
                                            {program.grNumber && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-600">
                                                        GR:
                                                    </span>
                                                    <span className="font-mono text-purple-600">
                                                        {program.grNumber}
                                                    </span>
                                                </div>
                                            )}
                                            {program.graduates_count !==
                                                undefined && (
                                                <span className="text-gray-500">
                                                    • {program.graduates_count}{' '}
                                                    graduates
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
