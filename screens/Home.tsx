import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Header } from '../components/Header';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { Div } from 'react-native-magnus';

export default function Home() {
    return (
        <Div justifyContent='center' alignItems='center' >
            <Header />
            <PomodoroTimer />
            <StatusBar style="auto" />
        </Div>
    );
}
