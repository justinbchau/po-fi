import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Div, Text } from 'react-native-magnus';

export function Header() {

    const { height } = useWindowDimensions();

    const marginBottom = height <= 667 ? 60 : 150;



    return (
        <Div mt="5%" mb={marginBottom}>
            <Text fontSize="7xl" color='white' fontWeight='bold'>Po-Fi</Text>
        </Div>
    );
}
