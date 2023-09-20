import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { getData, storeData } from '../utils/asyncStorage';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';



export default function HomeScreen() {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState({})


    const handleSearch = search => {
        console.log('=======================================');
        console.log('value: ', search);
        console.log('=======================================');



        if (search && search.length > 2)
            fetchLocations({ cityName: search }).then(data => {

                console.log('---------------------------------');
                console.log('got locations: ', data);
                console.log('---------------------------------');

                setLocations(data);
            })
    }

    const handleLocation = loc => {
        setLoading(true);
        toggleSearch(false);
        setLocations([]);
        fetchWeatherForecast({
            cityName: loc.name,
        }).then(data => {
            setLoading(false);
            setWeather(data);
            storeData('city', loc.name);
        })
    }

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Insein';
        if (myCity) {
            cityName = myCity;
        }
        fetchWeatherForecast({
            cityName,
        }).then(data => {

            console.log('***************************************');
            console.log('got data: ', data.forecast.forecastday.hour);
            console.log('***************************************');

            setWeather(data);
            setLoading(false);
        })

    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

    const { location, current } = weather;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Image
                source={require('../assets/images/091a32.png')}
                style={styles.bgImage}
            />
            {
                loading ? (
                    <View style={{flex:1, alignItems: "center",justifyContent: 'center'}}>
                        <Progress.CircleSnail thickness={10} size={100} color="#0bb3b2" />
                    </View>
                ) : (
                    <SafeAreaView style={styles.container1}>

                        <View style={styles.search}>
                            <View
                                style={styles.search1}
                            >

                                {
                                    showSearch ? (
                                        <TextInput
                                            onChangeText={handleTextDebounce}
                                            placeholder="Search city"
                                            placeholderTextColor={'lightgray'}
                                            
                                            style={{...styles.searchshow,borderWidth:1,borderColor:'#fff',borderRadius:20,marginLeft:10,backgroundColor:'#fff'}}
                                        />
                                    ) : null
                                }
                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showSearch)}
                                    style={styles.toggleSearch}>
                                    {
                                        showSearch ? (
                                            <XMarkIcon size="25" color="white" />
                                        ) : (
                                            <MagnifyingGlassIcon size="25" color="white" />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                            {
                                locations.length > 0 && showSearch ? (
                                    <View style={styles.showsearch}>
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations.length;

                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handleLocation(loc)}
                                                        style={{...styles.showsearchText,backgroundColor:'#fff'}}>
                                                        <MapPinIcon size="20" color="gray" />
                                                        <Text style={styles.showText}>{loc?.name}, {loc?.country}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }

                        </View>


                        <View style={styles.forecast}>

                            <Text style={styles.location}>
                                {location?.name},
                                <Text style={styles.locationtext}>{location?.country}</Text>
                            </Text>

                            <View style={styles.weather}>
                                <Image
                                    source={{ uri: 'https:' + current?.condition?.icon }}
                                    style={styles.weatherimg} />

                            </View>

                            <View >
                                <Text style={styles.degree} >
                                    {current?.temp_c}&#176;
                                </Text>
                                <Text style={styles.degreetext}>
                                    {current?.condition?.text}
                                </Text>
                            </View>


                            <View style={styles.statuscontainer}>
                                <View style={styles.status}>
                                    <Text> <Icon name="air" size={30} color="#fff" /></Text>
                                    <Text style={styles.statustext}>{current?.wind_kph}km</Text>
                                </View>
                                <View style={styles.status}>
                                <Text> <Icon name="water" size={30} color="#fff" /></Text>
                                    <Text style={styles.statustext}>{current?.humidity}%</Text>
                                </View>
                                

                            </View >
                            <View style={styles.statuscontainer}>
                                <View style={styles.status}>
                                <Text > <Feather name="sunrise" size={30} color="#fff" /></Text>
                                    <Text style={styles.statustext}>
                                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                    </Text>
                                </View>
                                <View style={styles.status }>
                                <Text> <Feather name="sunset" size={30} color="#fff" /></Text>
                                    <Text style={styles.statustext}>
                                        {weather?.forecast?.forecastday[0]?.astro?.sunset}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                )
            }

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    bgImage: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    container1: {
        display: 'flex',
        flex: 1,
    },
    search: {
        height: '10%',
        position: 'relative',
        zIndex: 50,
        marginTop: 30,
        marginRight: 15

    },
    forecast: {
        display: 'flex',
        flex: 1,
        justifyContent: 'space-around',
    },
    search1: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: 10


    },
    searchshow: {
        flex: 1,
        paddingBottom: 4,
        paddingLeft: 24,
        height: 40,
        fontSize: 16,
        lineHeight: 24,
        color: '#000'

    },
    toggleSearch: {
        padding: 24,
        margin: 4,
        borderRadius: 9999,

    },
    searchText: {
        flex: 1,
        paddingBottom: 4,
        paddingLeft: 24,
        height: 50,
        lineHeight: 24,
        color: 'yellow'
    },
    showsearch: {
        position: 'absolute',
        top: 30,
        borderRadius: 24,
        width: '80%',
        marginTop: 30,
        marginLeft: 10
    },
    showsearchText: {
        marginTop: 10,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20

    },
    showText: {
        marginLeft: 24,
        fontSize: 18,
        color: '#000',
    },
    location: {
        fontSize: 34,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    },
    locationtext: {
        fontSize: 30,
        lineHeight: 40,
        fontWeight: 600,
        color: '#D1D5DB'
    },
    weather: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    weatherimg: {
        width: 208,
        height: 208,
    },
    degree: {
        marginLeft: 20,
        fontSize: 80,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff'
    },
    degreetext: {
        fontSize: 20,
        lineHeight: 28,
        letterSpacing: 1.6,
        textAlign: 'center',
        color: 'gray'
    },
    statuscontainer: {
        marginLeft: 40,
        marginRight: 40,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    status: {
        marginLeft: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    statustext: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        lineHeight: 24,
        marginLeft: 15
    }

});