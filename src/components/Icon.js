import React from 'react';
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function Icon({ name, size = 24, color = '#ffffff', family = 'MaterialCommunityIcons', ...props }) {
    const IconComponent = {
        MaterialCommunityIcons,
        FontAwesome5,
        Ionicons,
        Feather,
    }[family] || MaterialCommunityIcons;

    return <IconComponent name={name} size={size} color={color} {...props} />;
}

// Predefined icons for the app
export const AppIcons = {
    birthday: { family: 'MaterialCommunityIcons', name: 'cake-variant' },
    anniversary: { family: 'MaterialCommunityIcons', name: 'heart' },
    other: { family: 'MaterialCommunityIcons', name: 'star' },
    family: { family: 'MaterialCommunityIcons', name: 'account-group' },
    friends: { family: 'MaterialCommunityIcons', name: 'account-multiple' },
    work: { family: 'MaterialCommunityIcons', name: 'briefcase' },
    calendar: { family: 'MaterialCommunityIcons', name: 'calendar' },
    gift: { family: 'MaterialCommunityIcons', name: 'gift' },
    settings: { family: 'MaterialCommunityIcons', name: 'cog' },
    add: { family: 'MaterialCommunityIcons', name: 'plus' },
    edit: { family: 'MaterialCommunityIcons', name: 'pencil' },
    delete: { family: 'MaterialCommunityIcons', name: 'delete' },
    notification: { family: 'MaterialCommunityIcons', name: 'bell' },
    close: { family: 'MaterialCommunityIcons', name: 'close' },
    check: { family: 'MaterialCommunityIcons', name: 'check' },
};