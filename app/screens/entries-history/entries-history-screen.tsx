import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import {  TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AuthContext, NavigatorParamList } from "../../navigators"
import { BulletItem, GradientBackground, Header, Screen } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"


const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
}
const ENTRIES: ViewStyle = {
  flex:1,
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

export const EntriesHistoryScreen: FC<StackScreenProps<NavigatorParamList, "entriesHistory">> = observer(function EntriesHistoryScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  const { signOut } = React.useContext(AuthContext)
  const goBack = () => signOut()
  return (
    <View testID="EntriesHistoryScreen" style={FULL}>
      <GradientBackground colors={[color.button , color.dark]} />
      <Screen style={CONTAINER} preset="fixed" backgroundColor={color.transparent}>
        <Header
          rightIcon="logout"
          onRightPress={goBack}
          style={HEADER}
          titleStyle={HEADER_TITLE}
          rightMaterialIcon
          leftMaterialIcon
          leftIcon={"account"}
        />

        <View style={ENTRIES}>

        </View>

      </Screen>
    </View>
  )
})
