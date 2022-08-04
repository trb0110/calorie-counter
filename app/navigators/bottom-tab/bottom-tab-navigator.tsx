import React, { useEffect, useState } from "react"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EntriesHistoryScreen, EntriesScreen, HomeScreen } from "../../screens"
import { color } from "../../theme"
import { loadString } from "../../utils/storage"

export type BottomTabNavigatorParamList = {
  home: undefined
  entries: undefined
  entriesHistory: undefined
}

const Tab = createBottomTabNavigator<BottomTabNavigatorParamList>()
export const BottomTabNavigator = () => {

  const [role,setRole]= useState<string>("")
  useEffect(()=>{
    (async ()=>{
      const temp = await loadString("role")
      setRole(temp)
    })()
  },[])
  return (
    <Tab.Navigator
      initialRouteName="entries"
      screenOptions={{
        tabBarActiveTintColor: color.primaryDarker,
        headerShown:false,
        tabBarStyle: { position: 'absolute',height:75,backgroundColor:color.transparent },
      }}

    >
      <Tab.Screen
        name="entries"
        component={EntriesScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, size }) => (
            <MaterialCommunityIcons name="food-apple" color={focused?color.tabBarIcon:color.lightGrey} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, size }) => (
            <MaterialCommunityIcons name="google-analytics" color={focused?color.tabBarIcon:color.lightGrey} size={size} />
          ),
        }}
      />
      {
        role ==="1"?
        <Tab.Screen
          name="entriesHistory"
          component={EntriesHistoryScreen}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused, size }) => (
              <MaterialCommunityIcons name="clock" color={focused?color.tabBarIcon:color.lightGrey} size={size} />
            ),
          }}

        />:null
      }

    </Tab.Navigator>
  )
}
