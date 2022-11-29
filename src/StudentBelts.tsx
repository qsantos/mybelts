import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { Belt, Evaluation, SkillDomain, Student, WaitlistEntry } from './api';
import BeltIcon from './BeltIcon';
import StudentAddToWaitlistButton from './StudentAddToWaitlistButton';
import StudentRemoveFromWaitlistButton from './StudentRemoveFromWaitlistButton';

interface Props {
    skill_domains: SkillDomain[];
    belts: Belt[];
    student: Student;
    evaluations: Evaluation[];
    canUseWaitlist: boolean;
    waitlist_entries: WaitlistEntry[];
    setWaitlistEntries: (waitlist_entries: WaitlistEntry[]) => void;
}

export default function StudentBelts(props: Props): ReactElement {
    const {
        skill_domains,
        belts,
        student,
        evaluations,
        canUseWaitlist,
        waitlist_entries,
        setWaitlistEntries,
    } = props;
    const { t } = useTranslation();

    const belt_by_id = Object.fromEntries(belts.map((belt) => [belt.id, belt]));
    const belt_by_rank = Object.fromEntries(
        belts.map((belt) => [belt.rank, belt])
    );
    const passed_evaluations = evaluations.filter(
        (evaluation) => evaluation.success
    );

    const waitlist_entries_by_skill_domain: {
        [index: number]: {
            index: number;
            waitlist_entry: WaitlistEntry;
        };
    } = {};
    waitlist_entries.forEach(
        (waitlist_entry: WaitlistEntry, index: number) =>
            (waitlist_entries_by_skill_domain[waitlist_entry.skill_domain_id] =
                { index, waitlist_entry })
    );

    const belt_of_skill_domain = (skill_domain: SkillDomain) => {
        const domain_evaluations = passed_evaluations.filter(
            (evaluation) => evaluation.skill_domain_id === skill_domain.id
        );
        if (domain_evaluations.length === 0) {
            // no successful evaluation yet
            const belt = belts[0];
            if (belt === undefined) {
                // should not happen
                console.error('no belt found');
                return null;
            }
            return null;
        }
        const sorted_domain_evaluations = domain_evaluations.sort((a, b) => {
            const belt_a = belt_by_id[a.belt_id];
            if (belt_a === undefined) {
                // should not happen
                console.error('belt ' + belt_a + ' not found');
                return 0;
            }
            const belt_b = belt_by_id[b.belt_id];
            if (belt_b === undefined) {
                // should not happen
                console.error('belt ' + belt_a + ' not found');
                return 0;
            }
            return belt_b.rank - belt_a.rank;
        });
        const best_evaluation = sorted_domain_evaluations[0];
        if (best_evaluation === undefined) {
            // should not happen
            console.error('no belt evaluation found');
            return null;
        }
        const belt_id = best_evaluation.belt_id;
        const belt = belt_by_id[belt_id];
        if (belt === undefined) {
            // should not happen
            console.error('belt ' + belt_id + ' not found');
            return null;
        }
        return belt;
    };

    return (
        <Table>
            <thead>
                <tr>
                    <th>{t('student.belts.skill_domain.title')}</th>
                    <th>{t('student.belts.achieved_belt.title')}</th>
                    {canUseWaitlist && student.can_register_to_waitlist && (
                        <th>{t('student.belts.actions.title')}</th>
                    )}
                </tr>
            </thead>
            <tbody>
                {skill_domains.map((skill_domain) => {
                    const belt = belt_of_skill_domain(skill_domain);
                    if (!canUseWaitlist) {
                        return null;
                    }
                    const next_belt = belt
                        ? belt_by_rank[belt.rank + 1]
                        : belt_by_rank[1];
                    if (!next_belt) {
                        return null;
                    }
                    const index_and_entry =
                        waitlist_entries_by_skill_domain[skill_domain.id];
                    if (index_and_entry) {
                        const { index, waitlist_entry } = index_and_entry;
                        return (
                            <tr
                                key={skill_domain.id}
                                className="skill-domain-on-waitlist"
                            >
                                <th>{skill_domain.name}</th>
                                <td>
                                    {belt ? (
                                        <BeltIcon belt={belt} />
                                    ) : (
                                        t('student.belts.no_belt')
                                    )}
                                </td>
                                {student.can_register_to_waitlist && (
                                    <td>
                                        <StudentRemoveFromWaitlistButton
                                            student={student}
                                            skill_domain={skill_domain}
                                            belt={next_belt}
                                            waitlist_entry={waitlist_entry}
                                            removedCallback={() => {
                                                const new_waitlist_entries = [
                                                    ...waitlist_entries,
                                                ];
                                                new_waitlist_entries.splice(
                                                    index,
                                                    1
                                                );
                                                setWaitlistEntries(
                                                    new_waitlist_entries
                                                );
                                            }}
                                        />
                                    </td>
                                )}
                            </tr>
                        );
                    } else {
                        return (
                            <tr key={skill_domain.id}>
                                <th>{skill_domain.name}</th>
                                <td>
                                    {belt ? (
                                        <BeltIcon belt={belt} />
                                    ) : (
                                        t('student.belts.no_belt')
                                    )}
                                </td>
                                {student.can_register_to_waitlist && (
                                    <td>
                                        <StudentAddToWaitlistButton
                                            student={student}
                                            skill_domain={skill_domain}
                                            belt={next_belt}
                                            addedCallback={(
                                                new_waitlist_entry
                                            ) => {
                                                setWaitlistEntries([
                                                    ...waitlist_entries,
                                                    new_waitlist_entry,
                                                ]);
                                            }}
                                        />
                                    </td>
                                )}
                            </tr>
                        );
                    }
                })}
            </tbody>
        </Table>
    );
}
