import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AuthContext, NavigatorParamList } from "../../navigators"
import {  Button, GradientBackground, Header, Screen, TextField } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing, typography } from "../../theme"
import { Api } from "../../services/api"
import { saveString } from "../../utils/storage"

const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  flex:1,
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}
const TEXTVIEW: ViewStyle = {
  flex:1,
  justifyContent:"center"

}
const TEXTINPUTSTYLE: ViewStyle = {
  marginVertical: spacing[4]
}
const BOLD: TextStyle = { fontWeight: "bold" }
const CONTINUE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
}
const FOOTER: ViewStyle = {  }
const FOOTER_CONTENT: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}
const HEADER: TextStyle = {
  borderRadius:100,
  textAlign: "center",
  alignSelf: "center",
  width: 200,
  height: 200,
  backgroundColor:color.button
}
const HEADER_TITLE: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 27,
  lineHeight: 30,
  textAlign: "center",
  letterSpacing: 1,
}

export const LoginScreen: FC<StackScreenProps<NavigatorParamList, "login">> = observer(function LoginScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook

  const { signIn } = React.useContext(AuthContext)
  const navigation = useNavigation()
  const [username,setUsername] = useState<string>("")
  const [password,setPassword] = useState<string>("")
  const nextScreen =  async () => {

    const authApi = new Api()
    await authApi.setup()
    await authApi.login(username, password).then(function (response) {
      // handle success
      console.log(response.kind)
      console.log(response.loginResult)
      if (response.kind === "ok") {
        const key = response.loginResult?.token
        const role = response.loginResult?.role
        const userid = response.loginResult?.id
        const username = response.loginResult?.name

        setTimeout(async () => {
          await saveString("token", key)
          await saveString("id", userid.toString())
          await saveString("role", role)
          await saveString("username", username)

          signIn({ key })
          // navigation.navigate("menu", { screen: "home" })
        }, 1500)
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
    })
    // navigation.navigate("homeStack")
  }
  return (
    <View testID="Login" style={FULL}>
      <GradientBackground colors={[color.button , color.dark]} />
      <Screen style={CONTAINER} preset="scroll" backgroundColor={color.transparent}>
        <View style={TEXTVIEW}>
          <Header headerTx="login.app" style={HEADER} titleStyle={HEADER_TITLE} />
          <TextField
            onChangeText={(value) => setUsername(value)}
            value={username}
            placeholder="Username"
            style={TEXTINPUTSTYLE}
          />
          <TextField
            onChangeText={(value) => setPassword(value)}
            value={password}
            placeholder="Password"
            style={TEXTINPUTSTYLE}
            secureTextEntry
           />
        </View>

      </Screen>
      <SafeAreaView style={FOOTER}>
        <View style={FOOTER_CONTENT}>
          <Button
            testID="next-screen-button"
            style={CONTINUE}
            textStyle={CONTINUE_TEXT}
            tx="login.continue"
            onPress={nextScreen}
          />
        </View>
      </SafeAreaView>
    </View>

  )
})
