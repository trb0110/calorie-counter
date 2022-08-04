import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AuthContext, NavigatorParamList } from "../../navigators"
import { Button,GradientBackground, Header, Screen, Text, TextField } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { FloatingAction } from "react-native-floating-action";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { SlideModal }  from 'react-native-slide-modal';
import { color, spacing, typography } from "../../theme"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useStores } from "../../models"
import { EntryApi } from "../../services/api/entry-api"
import DatePicker from 'react-native-modern-datepicker'
import { getToday } from 'react-native-modern-datepicker';
import { loadString } from "../../utils/storage"
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown"
import Feather from 'react-native-vector-icons/Feather'
import { NutriApi } from "../../services/api/nutritionix-api"
Feather.loadFont()

const { width:screenWidth,height:screenHeight } = Dimensions.get("screen")

const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
  width:screenWidth,
  paddingHorizontal: spacing[4],
}
const ENTRIES: ViewStyle = {
  flex:1,
  backgroundColor: color.transparent,
}
const BOLD: TextStyle = { fontWeight: "bold" }
const HEADER: TextStyle = {
  paddingTop: spacing[3],
  paddingHorizontal: spacing[4],
}
const HEADER_TITLE: TextStyle = {
  ...BOLD,
  fontSize: 22,
  lineHeight: 22,
  textAlign: "center",
  letterSpacing: 1.5,
  color:color.headerText
}

const LIST_CONTAINER: ViewStyle = {
  height:100,
  alignItems: "center",
  flexDirection: "row",
  flexWrap:"wrap",
  padding: spacing[2],
}
const LIST_TEXT: TextStyle = {
  height:25,
  fontSize:20,
  color: color.palette.white,
  fontFamily: typography.primary,
}
const FLAT_LIST: ViewStyle = {
  // flex:1,
  width:screenWidth*0.8,
}
const CALORIE_TEXT: TextStyle = {
  fontSize:16,
  textAlign: "center",
  color: color.palette.black,
  fontFamily: typography.primary,
}
const CALORIE_VIEW: ViewStyle&TextStyle = {
  borderRadius:100,
  alignSelf: "center",
  justifyContent:"center",
  width: 50,
  height: 50,
  marginRight: spacing[6],
  backgroundColor:color.palette.white
}

const INPUTVIEW: ViewStyle = {
  flex:1,
  height:screenHeight*0.85,
  marginBottom:spacing[4],
  marginHorizontal: spacing[6],

}
const TEXTVIEW: ViewStyle = {
  height:screenHeight*0.3,
  width:"100%",
  marginBottom:spacing[4],

}
const TEXTINPUTSTYLE: ViewStyle = {
  flex:1,
  marginVertical: spacing[2]
}
const TEXTINPUTDROPDOWNSTYLE: ViewStyle = {
  flex:1,
  marginVertical: spacing[2],
  zIndex:500
}
const DATEFILTERVIEW: ViewStyle = {

  flexDirection:"row",
  justifyContent:"center",
  alignContent:"center",
  alignItems:"center"
}
const DATEFILTERINPUT: ViewStyle = {
  flex:1,
}

const FOOTER_CONTENT: ViewStyle = {
  flex:1,
  justifyContent:"flex-end",
  height:200,
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}
const CONTINUE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
}
const customModalHeader={
  modalHeaderContainerLight: {
  },
  modalHeaderContainerDark: {
  },
}
const customModalContainer={
  modalContentContainerLight: {
    backgroundColor: color.lightGrey,
  },
  modalContentContainerDark: {
  },
}
const actions = [
  {
    // text: "Add Calorie",
    icon: <MaterialCommunityIcons name="food-apple" color={color.palette.white} size={30} />,
    name: "addCalorie",
    position: 1
  },

];
export const EntriesScreen: FC<StackScreenProps<NavigatorParamList, "entries">> = observer(function EntriesScreen() {

  const { entryStore } = useStores()
  const navigation = useNavigation()
  const tabBarHeight = useBottomTabBarHeight();
  const { entry } = entryStore

  const { signOut } = React.useContext(AuthContext)
  const [ modalVisible, setModalVisible ] = useState<boolean>(false);
  const [entryName,setEntryName] = useState<string>("")
  const [calorieCount,setCalorieCount] = useState<string>("")
  const [userID,setUserID] = useState<string>("")

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editEntryBool, setEditEntryBool] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [role,setRole]= useState<string>("")

  const [loading, setLoading] = useState(false)
  const [suggestionsList, setSuggestionsList] = useState(null)
  const [selectedEntryItem, setSelectedEntryItem] = useState(null)
  const [initialValue, setInitialValue] = useState(null)
  const dropdownController = useRef(null)
  const searchRef = useRef(null)
  const [todayDate]= useState(new Date().toISOString().split('T'))

  const nutriApi = new NutriApi()

  useEffect(()=>{
    (async ()=>{
      const temp = await loadString("role")
      setRole(temp)
      await nutriApi.setup()
    })()
  },[])
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData()
    });
    return unsubscribe;
  }, [navigation]);
  const goBack = () => signOut()
  const addEntry = (name)=>{
    setModalVisible(true)
    setSelectedItem({})
  }
  async function fetchData() {
    await entryStore.getEntries()
  }
  const saveTime = (selectedTime)=>{
    setSelectedTime(selectedTime)
    setShowTimePicker(false)
    setShowDatePicker(true)
  }
  const saveDate = (selectedDate)=>{
    setSelectedDate(selectedDate)
    setShowTimePicker(false)
    setShowDatePicker(false)
  }
  const saveEntry = async ()=>{
    setModalVisible(!modalVisible)

    const tempEntryName = selectedEntryItem || entryName
    if (!tempEntryName){
      resetFieldInputs()
      return
    }
    const entryApi = new EntryApi()
    await entryApi.setup()

    const userId = userID|| await loadString("id")


    const data = {
      entryName:tempEntryName,
      calorieCount,
      selectedDate,
      selectedTime,
      userId
    }
    const result = await entryApi.addEntry(data)
    if (result.kind === "ok") {
      fetchData()
    } else {
      setTimeout(() => {
        Alert.alert(
          "Error",
          "Error Occured",
          [
            {
              text: "OK",
              style: "cancel",
            },
          ],
          {
            cancelable: true,
          },
        )
      }, 1500)
    }
    resetFieldInputs()
  }
  const resetFieldInputs =()=>{
    setShowDatePicker(false)
    setShowTimePicker(false)
    setInitialValue(null)
    setLoading(false)
    setSelectedEntryItem("")
    setSuggestionsList(null)
    setEntryName("")
    setCalorieCount("")
    setSelectedDate("")
    setSelectedTime("")
    setSelectedItem({})
    setEditEntryBool(false)
    setUserID("")
  }
  const formatDate = ()=>{
    if (selectedDate.length>0||selectedTime.length>0){
      return selectedDate + " " + selectedTime
    }
    return ""
  }
  const searchEntries = async ()=>{
    await entryStore.filterEntries(selectedStartDate,selectedEndDate)
  }
  const editEntryHandler = async (item)=>{
    setEditEntryBool(true)
    setModalVisible(true)
    setSelectedItem(item)
    setSelectedEntryItem(item.Food)
    setUserID(item.UserID)
    setSuggestionsList([{id:1,title:item.Food}])
    setInitialValue({id:1,title:item.Food})
  }
  const editEntry = async ()=>{
    setEditEntryBool(false)
    setModalVisible(!modalVisible)
    const entryApi = new EntryApi()
    await entryApi.setup()
    const tempEntryName = selectedEntryItem || entryName
    const data = {
      item:selectedItem,
      entryName:tempEntryName,
      calorieCount,
      id:selectedItem?.CalorieId
    }
    const result = await entryApi.updateEntry(data)
    if (result.kind === "ok") {
      fetchData()
    } else {
      setTimeout(() => {
        Alert.alert(
          "Error",
          "Error Occured",
          [
            {
              text: "OK",
              style: "cancel",
            },
          ],
          {
            cancelable: true,
          },
        )
      }, 1500)
    }
    resetFieldInputs()
    console.log("edit")
  }

  const deleteEntry = async ()=>{
    setEditEntryBool(false)
    setModalVisible(!modalVisible)
    const entryApi = new EntryApi()
    await entryApi.setup()
    const result = await entryApi.deleteEntry(selectedItem.CalorieId)
    if (result.kind === "ok") {
      fetchData()
    } else {
      setTimeout(() => {
        Alert.alert(
          "Error",
          "Error Occured",
          [
            {
              text: "OK",
              style: "cancel",
            },
          ],
          {
            cancelable: true,
          },
        )
      }, 1500)
    }
    resetFieldInputs()
    console.log("Delete")
  }
  useEffect(()=>{
    if (selectedItem){
      setEntryName(selectedItem?.Food)
      setCalorieCount(selectedItem?.CalorieCount)

      // const entryDate = new Date(selectedItem?.Timestamp)
      // setSelectedDate(entryDate.toDateString())
      // console.log(selectedItem)
    }
  },[selectedItem])

  // console.log(entryName)
  const getSuggestions = useCallback(async q => {


    const filterToken = q.toLowerCase()
    // console.log('getSuggestions', q)
    setEntryName(q)
    if (typeof q !== 'string' || q.length < 3) {
      setSuggestionsList(null)
      return
    }
    setLoading(true)
    const response = await nutriApi.getLookup(filterToken)
    if (response.kind === "ok") {
      const data = response.lookup

      const suggestionMap = new Map()
      const suggestions = []
      data.map((item,index) => {

        const tagId = item["tag_id"]
        const foodEntry= {
          id: tagId,
          title: item["food_name"],
        }
        if (!suggestionMap.has(tagId)){
          suggestionMap.set(tagId, foodEntry)
        }
      })
      suggestionMap.forEach((value,key)=>{
        suggestions.push(value)
      })
      // console.log(suggestions)
      setInitialValue(null)
      setSuggestionsList(suggestions)
    } else {
      setTimeout(() => {
        Alert.alert(
          "Error",
          "Error Occured",
          [
            {
              text: "OK",
              style: "cancel",
            },
          ],
          {
            cancelable: true,
          },
        )
      }, 1500)
    }
    setLoading(false)
  }, [])

  const onClearPress = useCallback(() => {
    setSuggestionsList(null)
    setSelectedEntryItem(null)
    setInitialValue(null)
  }, [])

  const onOpenSuggestionsList = useCallback(isOpened => {}, [])

  const Item = ({item})=>{
    const itemDate = new Date(item.Timestamp);
    const disabledBool = role !=="1"
    return  (
      <TouchableOpacity disabled={disabledBool} onPress={()=>{editEntryHandler(item)}}>
        <View style={LIST_CONTAINER} key={item.CalorieId}>
          <View style={CALORIE_VIEW}>
            <Text style={CALORIE_TEXT}>
              {item.CalorieCount}
            </Text>
          </View>
          <View style={{flexDirection:"column"}}>
            <Text style={LIST_TEXT}>
              {item.Username}
            </Text>
            <Text style={LIST_TEXT}>
              {item.Food}
            </Text>
            <Text style={LIST_TEXT}>
              {itemDate.toDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const dropdownTextInputProps:TextInputProps = {
    placeholder: 'Food Entry Name',
    autoCorrect: false,
    autoCapitalize: 'none',
    style: {
      fontFamily: typography.primary,
      borderRadius: 25,
      fontSize: 18,
      color: color.text,
    },
  }

  return (
    <View testID="EntriesScreen" style={FULL}>
      <GradientBackground colors={[color.button , color.dark]} />

      <SlideModal
        modalType="iOS Form Sheet"
        modalVisible={modalVisible}
        screenContainer={
          <Screen style={CONTAINER} preset="fixed" backgroundColor={color.transparent} tabBarHeight={tabBarHeight}>
            <Header
              rightIcon="logout"
              onRightPress={goBack}
              style={HEADER}
              titleStyle={HEADER_TITLE}
              rightMaterialIcon
              leftMaterialIcon
              leftIcon={"account"}
            />
            <View style={[ENTRIES]}>
              <View style={DATEFILTERVIEW}>
                <TextField
                  onChangeText={(value) => setSelectedStartDate(value)}
                  value={selectedStartDate}
                  placeholder="Start Date"
                  style={DATEFILTERINPUT}
                />
                <TextField
                  onChangeText={(value) => setSelectedEndDate(value)}
                  value={selectedEndDate}
                  placeholder="End Date"
                  style={DATEFILTERINPUT}
                />
                <TouchableOpacity onPress={searchEntries} >
                  <MaterialCommunityIcons name={"calendar-search"} size={27} color={color.palette.white} />
                </TouchableOpacity>
              </View>
              <FlatList
                contentContainerStyle={FLAT_LIST}
                data={[...entry]}
                keyExtractor={(item) => String(item.CalorieId)}
                renderItem={Item}
                showsVerticalScrollIndicator={false}
                horizontal={false}
              />

              <FloatingAction
                actions={actions}
                onPressItem={addEntry}
                distanceToEdge={20}
                overlayColor={color.transparent}
                showBackground={true}
              />

            </View>
          </Screen>
        }
        modalContainer={
        <>
          <View style={INPUTVIEW}>
            <View style={TEXTVIEW}>

              <View style={TEXTINPUTDROPDOWNSTYLE}>
                <AutocompleteDropdown
                  ref={searchRef}
                  controller={controller => {
                    dropdownController.current = controller
                  }}
                  initialValue={initialValue}
                  direction={Platform.select({ ios: 'down' })}
                  dataSet={suggestionsList}
                  onChangeText={getSuggestions}
                  onSelectItem={item => {
                    item && setSelectedEntryItem(item.title)
                  }}
                  debounce={600}
                  suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
                  onClear={onClearPress}
                  //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
                  onOpenSuggestionsList={onOpenSuggestionsList}
                  loading={loading}
                  useFilter={false} // set false to prevent rerender twice
                  textInputProps={dropdownTextInputProps}
                  rightButtonsContainerStyle={{
                    right: 8,
                    height: 30,

                    alignSelf: 'center',
                  }}
                  inputContainerStyle={{
                    borderRadius:10,
                    minHeight: 44,
                    backgroundColor: color.palette.white,
                    marginHorizontal:spacing[2]
                  }}
                  suggestionsListContainerStyle={{
                    backgroundColor: '#383b42',
                  }}
                  containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                  renderItem={(item, text) => <Text style={{ color: '#fff', padding: 15 }}>{item.title}</Text>}
                  ChevronIconComponent={<Feather name="chevron-down" size={20} color={color.palette.black} />}
                  ClearIconComponent={<Feather name="x-circle" size={18} color={color.palette.black} />}
                  inputHeight={50}
                  showChevron={false}
                  closeOnBlur={true}
                  onFocus={()=>{
                    setShowDatePicker(false)
                    setShowTimePicker(false)
                  }}
                  onBlur={()=>{
                    setInitialValue(null)
                    setSuggestionsList([])
                  }}
                  //  showClear={false}
                />
              </View>
              {role==="1"?
                <TextField
                  onChangeText={(value) => setUserID(value)}
                  value={userID}
                  placeholder="User ID"
                  style={TEXTINPUTSTYLE}
                  onFocus={()=>{
                    setShowDatePicker(false)
                    setShowTimePicker(false)
                  }}
                />
                :null}
              <TextField
                onChangeText={(value) => setCalorieCount(value)}
                value={calorieCount}
                placeholder="Calorie Count"
                style={TEXTINPUTSTYLE}
                keyboardType={'numeric'}
                onFocus={()=>{
                  setShowDatePicker(false)
                  setShowTimePicker(false)
                }}
              />
              <TextField
                value={formatDate()}
                placeholder="Date/Time"
                style={TEXTINPUTSTYLE}
                editable={false}
                onPressIn={()=>{
                  setShowDatePicker(false)
                  setShowTimePicker(true)
                }}
              />
            </View>
            {
              showDatePicker?
                <DatePicker
                  onSelectedChange={(date) => saveDate(date)}
                  options={{
                    backgroundColor: color.lightGrey,
                    textHeaderColor: '#FFA25B',
                    textDefaultColor: color.button,
                    selectedTextColor: '#fff',
                    mainColor: '#F4722B',
                    textSecondaryColor: color.button,
                    borderColor: 'rgba(122, 146, 165, 0.5)',
                  }}
                  current={getToday()}
                  mode="calendar"
                  minuteInterval={30}
                  style={{ borderRadius: 10 }}
                  maximumDate={todayDate[0]}
                />
                :
                null
            }
            {showTimePicker?
                <DatePicker
                  mode="time"
                  minuteInterval={1}
                  options={{
                    backgroundColor: color.lightGrey,
                    textHeaderColor: '#FFA25B',
                    textDefaultColor: color.button,
                    selectedTextColor: '#fff',
                    mainColor: '#F4722B',
                    textSecondaryColor: '#D6C7A1',
                    borderColor: 'rgba(122, 146, 165, 0.1)',
                    borderRadius: 100
                  }}
                  onTimeChange={selectedTime => saveTime(selectedTime)}
                />:null
            }
            {role==="1"?

              <View style={FOOTER_CONTENT}>
                <Button
                  testID="next-screen-button"
                  style={CONTINUE}
                  textStyle={CONTINUE_TEXT}
                  tx="common.delete"
                  onPress={deleteEntry}
                />
              </View>
              :null}
          </View>
        </>
        }
        modalHeaderTitle=""
        pressDone={editEntryBool?editEntry:saveEntry}
        pressCancel={() => {
          resetFieldInputs()
          setModalVisible(!modalVisible)
        }}
        darkMode={false}
        doneDisabled={false}
        customStyleModalContentContainer={customModalContainer}
        customStyleModalHeaderContainer={customModalHeader}
      />
    </View>

  )
})
