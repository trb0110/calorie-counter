import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, FlatList, TextStyle, useWindowDimensions, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AuthContext, NavigatorParamList } from "../../navigators"
import { Button, GradientBackground, Header, Screen, Text } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { color, spacing, typography } from "../../theme"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import * as Progress from "react-native-progress"
import { useStores } from "../../models"
import { loadString } from "../../utils/storage"

const { width:screenWidth,height:screenHeight } = Dimensions.get("screen")

const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  flex: 1,
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
}
const PROGRESS: ViewStyle = {
  height:screenHeight*0.7,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor: color.transparent,
}
const BOLD: TextStyle = { fontWeight: "bold" }
const HEADER: TextStyle = {
  paddingTop: spacing[3],
  paddingBottom: spacing[5] - 1,
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

const FLAT_LIST: ViewStyle = {
  width:screenWidth*0.9,
}

const LIST_CONTAINER: ViewStyle = {
  height:150,
  alignItems: "center",
  flexDirection: "row",
  // flexWrap:"wrap",
  padding: spacing[2],
}
const LIST_TEXT: TextStyle = {
  height:25,
  fontSize:20,
  color: color.palette.white,
  fontFamily: typography.primary,
  paddingHorizontal: spacing[4],
}


const CONTINUE: ViewStyle = {
  flex:1,
  backgroundColor:color.palette.white,
  marginVertical:spacing[4],
  marginHorizontal: spacing[4],
}
const TEXT: TextStyle = {
  color: color.palette.black,
  fontFamily: typography.primary,
}
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 16,
  paddingHorizontal: spacing[2],
  letterSpacing: 2,
}
const CALORIELIMIT = 2100
const Item = ({item})=>{
  const progressBar = item.calories/CALORIELIMIT
  const averageCalorieCount = item.calories/item.count
  return  (
    <View style={LIST_CONTAINER} key={item.username}>
      <Progress.Circle
        size={100}
        thickness={5}
        indeterminate={false}
        progress={progressBar}
        borderWidth={0}
        showsText
        formatText={()=>{
          return item.calories +" cal"
        }}
        strokeCap={"round"}
      />
      <View style={{flexDirection:"column"}}>
        <Text style={LIST_TEXT}>
          {item.username}
        </Text>
        <Text style={LIST_TEXT}>
          Number of entries {item.count}
        </Text>
        <Text style={LIST_TEXT}>
          Average per day {averageCalorieCount.toFixed(2)}
        </Text>
      </View>
    </View>
  )
}

const UserItem = ({item})=>{
  const progressBar = item.calories/CALORIELIMIT
  return  (
    <View style={LIST_CONTAINER} key={item.entryDate}>
      <Progress.Circle
        size={100}
        thickness={5}
        indeterminate={false}
        progress={progressBar}
        borderWidth={0}
        showsText
        formatText={()=>{
          return item.calories +" cal"
        }}
        strokeCap={"round"}
      />
      <View style={{flexDirection:"column"}}>
        <Text style={LIST_TEXT}>
          {item.entryDate}
        </Text>
        <Text style={LIST_TEXT}>
          Number of entries {item.count}
        </Text>
      </View>
    </View>
  )
}

export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "home">> = observer(function HomeScreen() {

  const navigation = useNavigation()

  const { entryStore } = useStores()
  const { entry } = entryStore

  const { signOut } = React.useContext(AuthContext)
  const [calorieCount, setCalorieCount] = useState<number>(0)
  const [caloriePercent, setCaloriePercent] = useState<number>(0)
  const [role,setRole]= useState<string>("")
  const [updateProgress,setUpdateProgress]= useState<boolean>(false)
  const [userProgress,setUserProgress]= useState<any>([])
  const [userProgressWeekBefore,setUserProgressWeekBefore]= useState<any>([])
  const [showPresentWeek,setShowPresentWeek]= useState<any>(true)

  const calculatePerc = ()=>{
    let presentDate = new Date();
    const sum = entry.reduce((accumulator, object) => {

      const entryDate=new Date(object.Timestamp)
      let Difference_In_Time = presentDate.getTime() - entryDate.getTime();
      let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      if (Difference_In_Days<1){
        const count = +object.CalorieCount
        return accumulator + count;
      }
      return accumulator
    }, 0);
    setCalorieCount(sum)
    let calPercent = sum/CALORIELIMIT
    return calPercent
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {

      (async ()=>{
        const temp = await loadString("role")
        setRole(temp)
      })()

      setUpdateProgress(true)
      // setCaloriePercent(calculatePerc())
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(()=>{
    if (updateProgress&&role){
      setUpdateProgress(false)
      if (role==="1"){
        const userProgress = new Map()
        const userProgressWeekBefore = new Map()
        let presentDate = new Date();
        let userArray = []
        let userArrayWeekBefore = []
        entry.map((ent)=>{
          if (ent.UserID!=="1"){
            const entryDate=new Date(ent.Timestamp)
            let Difference_In_Time = presentDate.getTime() - entryDate.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            const username = ent.Username
            if (Difference_In_Days<8){
              if (userProgress.has(username)){
                const prog = userProgress.get(username)
                const newProg = parseInt(prog.calories)+parseInt(ent.CalorieCount)
                const newCount = parseInt(prog.count)+1
                  userProgress.set(username, { count:newCount,calories:newProg })
              }else{
                userProgress.set(username, { count:1,calories:ent.CalorieCount })
              }
            }else if (Difference_In_Days>=8) {
              if (userProgressWeekBefore.has(username)) {
                const prog = userProgressWeekBefore.get(username)
                const newProg = parseInt(prog.calories) + parseInt(ent.CalorieCount)
                const newCount = parseInt(prog.count) + 1
                userProgressWeekBefore.set(username, { count: newCount, calories: newProg })
              }else{
                userProgressWeekBefore.set(username,{ count:1,calories:ent.CalorieCount })
              }
            }


          }
        })
        userProgress.forEach((value,key)=>{
          const userdata = { username:key, count:value.count,calories:value.calories}
          userArray.push(userdata)
        })
        userProgressWeekBefore.forEach((value,key)=>{
          const userdata = { username:key, count:value.count,calories:value.calories}
          userArrayWeekBefore.push(userdata)
        })
        setUserProgress(userArray)
        setUserProgressWeekBefore(userArrayWeekBefore)
      }else{
        const userProgress = new Map()
        let userArray = []
        entry.map((ent)=>{
          if (ent.UserID!=="1"){
            const entryDate=new Date(ent.Timestamp).toISOString().split('T')[0]
            if (userProgress.has(entryDate)){
              const prog = userProgress.get(entryDate)
              const newProg = parseInt(prog.calories)+parseInt(ent.CalorieCount)
              const newCount = parseInt(prog.count)+1
              userProgress.set(entryDate, { count:newCount,calories:newProg })
            }else{
              userProgress.set(entryDate, { count:1,calories:ent.CalorieCount })
            }
          }
        })
        userProgress.forEach((value,key)=>{
          const userdata = { entryDate:key, count:value.count,calories:value.calories}
          userArray.push(userdata)
        })
        setUserProgress(userArray)
      }
    }
  },[role,updateProgress])

  const tabBarHeight = useBottomTabBarHeight();

  const renderProgress = () => {
    if (role==="1"){
      return <FlatList
        contentContainerStyle={FLAT_LIST}
        data={showPresentWeek?userProgress:userProgressWeekBefore}
        keyExtractor={(item) => String(item.username)}
        renderItem={Item}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      />
    }else {
      return <FlatList
        contentContainerStyle={FLAT_LIST}
        data={userProgress}
        keyExtractor={(item) => String(item.entryDate)}
        renderItem={UserItem}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      />
    }
  }
  return (
    <View testID="HomeScreen" style={FULL}>
      <GradientBackground colors={[color.button , color.dark]} />
      <Screen style={CONTAINER} preset="fixed" backgroundColor={color.transparent} tabBarHeight={tabBarHeight}>
        <Header
          rightIcon="logout"
          onRightPress={()=>signOut()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
          rightMaterialIcon
          leftMaterialIcon
          leftIcon={"account"}
        />

        <View style={PROGRESS}>
          {
            role ==="1"?
              <View style={{flexDirection:"row"}}>
                <Button
                  testID="next-screen-button"
                  style={CONTINUE}
                  textStyle={CONTINUE_TEXT}
                  tx="common.firstWeek"
                  onPress={()=>setShowPresentWeek(true)}
                />
                <Button
                  testID="next-screen-button"
                  style={CONTINUE}
                  textStyle={CONTINUE_TEXT}
                  tx="common.weekBefore"
                  onPress={()=>setShowPresentWeek(false)}
                />
              </View>
              :null
          }

          {renderProgress()}
        </View>

      </Screen>
    </View>
  )
})
