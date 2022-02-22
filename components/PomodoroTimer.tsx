import React, { useCallback, useEffect, useRef } from 'react';
import { Vibration, useWindowDimensions, SafeAreaView, View, StyleSheet } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { Div, Text, Button, Icon, Modal, Input } from 'react-native-magnus';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

const TIMES = {
    WORK: 25 * 60,
    BREAK: 5 * 60,
}

const playlist = require('../assets/playlist.json');
const sfx = require('../assets/sfx.json');

export function PomodoroTimer() {
    const [playing, setPlaying] = React.useState(false);
    const [key, setKey] = React.useState(0);
    const [time, setTime] = React.useState(TIMES.WORK);
    const [customTime, setCustomTime] = React.useState(TIMES);
    const [currentSong, setCurrentSong] = React.useState(0);
    const [visible, setVisible] = React.useState(false);

    const soundRef = useRef<Sound | null>(null);
    const bellRef = useRef<Sound | null>(null)

    /**
     * Loads the sound and automatically plays if "playing" is true.
     */
    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            { uri: playlist[currentSong].uri },
            { shouldPlay: playing }
        );
        soundRef.current = sound;
        soundRef.current?.setOnPlaybackStatusUpdate(onStatusUpdate);
    };

    /**
     * Loads the sfx
     */
    const loadSfx = useCallback(async () => {
        const { sound } = await Audio.Sound.createAsync(
            { uri: sfx[0].uri },
        );
        bellRef.current = sound;
    }, []);

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });
    }, []);

    useEffect(() => {
        loadSound();
    }, [currentSong]);

    useEffect(() => {
        loadSfx();
    }, [loadSfx]);

    const onStatusUpdate = async (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.log('Failed to load the sound', status.error);
            }
        } else {
            if (status.didJustFinish && !status.isLooping) {
                await playNextSound();
            }
        }
    }

    function nextSound() {
        if (currentSong > playlist.length - 1) {
            setCurrentSong(0);
        } else {
            setCurrentSong(currentSong + 1);
        }
    }

    /**
     * Function that changes the current sound, loads it and then play.
     */
    async function playNextSound() {
        console.log('Playing next sound');

        await unloadSound();
        nextSound();
        await playSound();
    }

    async function playSound() {
        console.log('Playing Sound');
        // Checks if there is a song before trying to play it.
        if (!soundRef.current) await loadSound();
        // Check if not playing so that we don't call playAsync twice because of the loadSound() function
        if (!playing) await soundRef.current?.playAsync();
    }


    async function pauseSound() {
        console.log('Pausing Sound');
        await soundRef.current?.pauseAsync();
    }

    async function replaySound() {
        console.log('Replaying Sound');
        await soundRef.current?.replayAsync(); // Replay the current sound.
    }

    async function unloadSound() {
        console.log('Unloading Sound');
        await soundRef.current?.unloadAsync();
    }


    const startTimer = () => {
        setPlaying(true);
        playSound();
    }

    const pauseTimer = () => {
        setPlaying(false);
        pauseSound();
    }


    const resetTimer = (shouldPlay: boolean = true) => {
        setTime(customTime.WORK);
        setKey(key + 1);

        // Starts playing if it was paused.
        if (shouldPlay) {
            setPlaying(true);
            replaySound();
        } else {
            setPlaying(false);
            pauseSound()
        }
    }

    const playBell = () => {
        bellRef.current?.playAsync();
    }

    const onFinish = () => {
        if (time === customTime.WORK) {
            // Switching to Break
            playBell();
            Vibration.vibrate(1000);
            setTime(customTime.BREAK);
            setPlaying(true)
            setKey(key + 1);
            unloadSound();
        } else {
            // Switching back to work
            bellRef.current?.replayAsync();
            Vibration.vibrate(1000);
            setTime(customTime.WORK);
            setPlaying(false)
            setKey(key + 1);
            nextSound();
        }
    }

    const { height } = useWindowDimensions();

    const marginTop = height <= 667 ? 80 : 130;


    return (
        <Div>
            {/* Add a safe area widget to add the background color to */}
                <Modal isVisible={visible}>
                    <View style={styles.container}>
                        <Button
                            bg="primaryBlue"
                            h={40}
                            w={40}
                            mx="xl"
                            rounded="circle"
                            shadow="md"
                            borderless
                            position="absolute"
                            top={50}
                            right={15}
                            zIndex={2}
                            onPress={() => setVisible(false)}
                        >
                            <Icon color='white' name="close" />
                        </Button>
                        <Div flex={1} justifyContent="center" alignItems='center'>
                            <Div flexDir="row" justifyContent='space-between' alignItems='center' w={150} my={10}>
                                <Text color="white">Time</Text>
                                <Input
                                    w={100}
                                    defaultValue={(customTime.WORK / 60).toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => parseFloat(text) && setCustomTime({ ...customTime, WORK: parseFloat(text) * 60 })}
                                />
                            </Div>
                            <Div flexDir="row" justifyContent='space-between' alignItems='center' w={150} my={10}>
                                <Text color="white">Break</Text>
                                <Input
                                    w={100}
                                    defaultValue={(customTime.BREAK / 60).toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => parseFloat(text) && setCustomTime({ ...customTime, BREAK: parseFloat(text) * 60 })}
                                />
                            </Div>
                            <Div w={150} my={10}>
                                <Button
                                    bg="primaryBlue"
                                    h={40}
                                    w={150}
                                    mx="xl"
                                    shadow="md"
                                    alignSelf='center'
                                    onPress={() => {
                                        setVisible(false);
                                        resetTimer(false)
                                    }
                                    }>
                                    <Text color='white'>Submit</Text>
                                </Button>
                            </Div>
                        </Div>
                    </View>
                </Modal>
                <Button
                    bg="primaryBlue"
                    h={40}
                    w={40}
                    mx="xl"
                    rounded="circle"
                    shadow="md"
                    borderless
                    alignSelf='flex-end'
                    onPress={() => setVisible(true)}
                >
                    <Icon name="settings" color="white" fontFamily="Feather" fontSize="lg" />
                </Button>
                <Div alignItems='center'>
                    <CountdownCircleTimer
                        key={key}
                        isPlaying={playing}
                        duration={time}
                        colors={['#6C7BFF', '#F7B801', '#A30000', '#A30000']}
                        colorsTime={[7, 5, 2, 0]}
                        size={270}
                        onComplete={() => onFinish()}
                        children={({ remainingTime }) => {
                            const minutes = Math.floor(remainingTime / 60)
                            const seconds = String(remainingTime % 60).padStart(2, '0');

                            return <Text fontWeight="bold"
                                fontSize="7xl" color='white'>{minutes}:{seconds}</Text>
                        }}
                    />
                </Div>

                {/* Implement an Error component */}

                <Div row justifyContent="center" mt={marginTop}>
                    <Button
                        bg="primaryBlue"
                        h={60}
                        w={60}
                        mx="xl"
                        rounded="circle"
                        shadow="md"
                        borderless
                        onPress={() => resetTimer(false)}
                    >
                        <Icon name="rotate-ccw" color="white" fontFamily="Feather" fontSize="2xl" />
                    </Button>

                    <Button
                        bg="primaryBlue"
                        h={60}
                        w={60}
                        mx="xl"
                        rounded="circle"
                        shadow="md"
                        borderless
                        onPress={() => {
                            if (playing)
                                return pauseTimer();

                            return startTimer();
                        }}
                    >
                        <Icon name={playing ? "pause" : "play"} color="white" fontFamily="Feather" fontSize="2xl" />
                    </Button>

                    <Button
                        bg="primaryBlue"
                        h={60}
                        w={60}
                        mx="xl"
                        rounded="circle"
                        shadow="md"
                        borderless
                        onPress={() => playNextSound()}
                        disabled={!playing}
                    >
                        <Icon name="skip-forward" color="white" fontFamily="Feather" fontSize="2xl" />
                    </Button>
                </Div>
        </Div>
    );
}

// Add background color for the settings
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2D2D2D',
        height: '100%',
        flex: 1,
    }
});