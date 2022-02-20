import React, { useCallback, useEffect, useRef } from 'react';
import { Vibration, useWindowDimensions } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { Div, Text, Button, Icon } from 'react-native-magnus';
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
    const [currentSong, setCurrentSong] = React.useState(0);

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
                await nextSound();
            }
        }
    }

    /**
     * Function that changes the current sound, loads it and then play.
     */
    async function nextSound() {
        console.log('Playing next sound');
        setCurrentSong(currentSong + 1);
    }

    async function playSound() {
        console.log('Playing Sound');
        // Checks if there is a song before trying to play it.
        if (!soundRef.current) await loadSound();
        await soundRef.current?.playAsync();
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


    const resetTimer = () => {
        setTime(TIMES.WORK);
        setKey(key + 1);

        // Starts playing if it was paused.
        if (!playing) setPlaying(true);
        replaySound();
    }

    const playBell = () => {
        bellRef.current?.playAsync();
    }

    const onFinish = () => {
        if (time === TIMES.WORK) {
            // Switching to Break
            playBell();
            Vibration.vibrate(1000);
            setTime(TIMES.BREAK);
            setPlaying(true)
            setKey(key + 1);
            unloadSound();
        } else {
            // Switching back to work
            bellRef.current?.replayAsync();
            Vibration.vibrate(1000);
            setTime(TIMES.WORK);
            setPlaying(false)
            setKey(key + 1);
            if (currentSong > playlist.length - 1) {
                setCurrentSong(0);
            } else {
                setCurrentSong(currentSong + 1);
            }
        }
    }

    const { height } = useWindowDimensions();

    const marginTop = height <= 667 ? 50 : 130;


    return (
        <Div>
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
                        const seconds = remainingTime % 60

                        return <Text fontWeight="bold"
                            fontSize="7xl" color='white'>{minutes}:{seconds}</Text>
                    }}
                />
            </Div>

            {/* Implement an Error component */}

            <Div row mt={marginTop}>
                <Button
                    bg="primaryBlue"
                    h={60}
                    w={60}
                    mx="xl"
                    rounded="circle"
                    shadow="md"
                    borderless
                    onPress={() => startTimer()}
                >
                    <Icon name="play" color="white" fontFamily="Feather" fontSize="2xl" />
                </Button>
                <Button
                    bg="primaryBlue"
                    h={60}
                    w={60}
                    mx="xl"
                    rounded="circle"
                    shadow="md"
                    borderless
                    onPress={() => pauseTimer()}
                >
                    <Icon name="pause" color="white" fontFamily="Feather" fontSize="2xl" />
                </Button>
                <Button
                    bg="primaryBlue"
                    h={60}
                    w={60}
                    mx="xl"
                    rounded="circle"
                    shadow="md"
                    borderless
                    onPress={() => resetTimer()}
                >
                    <Icon name="rotate-ccw" color="white" fontFamily="Feather" fontSize="2xl" />
                </Button>
            </Div>

        </Div>
    );
}