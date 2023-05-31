import { classesMap } from "$lib/constants/classes";
import {
    StatusEffectBuffTypeFlags,
    type StatusEffect,
    type Entity,
    StatusEffectTarget,
    MeterTab,
    Buff,
    BuffDetails,
    type Skill
} from "$lib/types";
import { round } from "./numbers";

export function defaultBuffFilter(buffType: number): boolean {
    return (
        ((StatusEffectBuffTypeFlags.DMG |
            StatusEffectBuffTypeFlags.CRIT |
            StatusEffectBuffTypeFlags.ATKSPEED |
            StatusEffectBuffTypeFlags.COOLDOWN) &
            buffType) !==
        0
    );
}

export function groupedSynergiesAdd(
    map: Map<string, Map<number, StatusEffect>>,
    key: string,
    id: number,
    buff: StatusEffect,
    focusedPlayer: Entity | null
) {
    // by default, only show dmg, crit, atk spd, cd buffs.
    // show all arcana cards for fun
    if (!focusedPlayer || focusedPlayer.classId !== 202) {
        if (!defaultBuffFilter(buff.buffType)) {
            // console.log(buff);
            return;
        }
    }
    key = key.replaceAll(" ", "").toLowerCase();
    if (map.has(key)) {
        map.get(key)?.set(id, buff);
    } else {
        map.set(key, new Map([[id, buff]]));
    }
}

export function filterStatusEffects(
    groupedSynergies: Map<string, Map<number, StatusEffect>>,
    buff: StatusEffect,
    id: number,
    focusedPlayer: Entity | null,
    tab: MeterTab
) {
    // Party synergies
    if (["classskill", "identity", "ability"].includes(buff.buffCategory) && buff.target === StatusEffectTarget.PARTY) {
        if (tab === MeterTab.PARTY_BUFFS) {
            const key = `${classesMap[buff.source.skill?.classId ?? 0]}_${
                buff.uniqueGroup ? buff.uniqueGroup : buff.source.skill?.name
            }`;
            groupedSynergiesAdd(groupedSynergies, key, id, buff, focusedPlayer);
        }
    }
    // Self synergies
    else if (["pet", "cook", "battleitem", "dropsofether", "bracelet"].includes(buff.buffCategory)) {
        if (tab === MeterTab.SELF_BUFFS && !focusedPlayer) {
            groupedSynergiesAdd(groupedSynergies, buff.buffCategory, id, buff, focusedPlayer);
        }
    } else if (["set"].includes(buff.buffCategory)) {
        if (tab === MeterTab.SELF_BUFFS && !focusedPlayer) {
            groupedSynergiesAdd(groupedSynergies, `set_${buff.source.setName}`, id, buff, focusedPlayer);
        }
    } else if (["classskill", "identity", "ability"].includes(buff.buffCategory)) {
        // self & other identity, classskill, engravings
        if (tab === MeterTab.SELF_BUFFS && focusedPlayer) {
            let key;
            if (buff.buffCategory === "ability") {
                key = `${buff.uniqueGroup ? buff.uniqueGroup : id}`;
            } else {
                if (focusedPlayer.classId !== buff.source.skill?.classId) return; // We hide other classes self buffs (classskill & identity)
                key = `${classesMap[buff.source.skill?.classId ?? 0]}_${
                    buff.uniqueGroup ? buff.uniqueGroup : buff.source.skill?.name
                }`;
            }
            groupedSynergiesAdd(groupedSynergies, key, id, buff, focusedPlayer);
        }
    } else {
        // ignore
    }
}

export function getSynergyPercentageDetails(groupedSynergies: Map<string, Map<number, StatusEffect>>, skill: Skill) {
    const synergyPercentageDetails: BuffDetails[] = [];
    groupedSynergies.forEach((synergies, key) => {
        let synergyDamage = 0;
        const buff = new BuffDetails();
        buff.id = key;
        synergies.forEach((syn, id) => {
            if (skill.buffedBy[id]) {
                buff.buffs.push(
                    new Buff(
                        syn.source.icon,
                        round((skill.buffedBy[id] / skill.totalDamage) * 100),
                        syn.source.skill?.icon
                    )
                );
                synergyDamage += skill.buffedBy[id];
            } else if (skill.debuffedBy[id]) {
                buff.buffs.push(
                    new Buff(
                        syn.source.icon,
                        round((skill.debuffedBy[id] / skill.totalDamage) * 100),
                        syn.source.skill?.icon
                    )
                );
                synergyDamage += skill.debuffedBy[id];
            }
        });

        if (synergyDamage > 0) {
            buff.percentage = round((synergyDamage / skill.totalDamage) * 100);
        }
        synergyPercentageDetails.push(buff);
    });

    return synergyPercentageDetails;
}
