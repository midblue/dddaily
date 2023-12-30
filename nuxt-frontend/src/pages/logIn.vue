<template>
  <PageTemplate class="flexcolumn flexcenter gap">
    I am
    <input
      v-model="inputUserId"
      autofocus
      autocomplete="false"
      autocorrect="false"
      autocapitalize="false"
      spellcheck="false"
      @keydown.enter="tryLogIn"
    />
    <br />
    <!-- password: <input v-model="inputPassword" />
    <br /> -->
    <button @click="tryLogIn">go</button>
    <!-- <button @click="trySignUp">sign up</button> -->
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'

let inputUserId = ref('')
// let inputPassword = ref('')

onMounted(() => {
  const loadedUserId = appState.getUserId()
  if (loadedUserId) {
    c.log('loaded UserId on login page', loadedUserId)
    inputUserId.value = loadedUserId
  }
  // const loadedPassword = appState.getPassword()
  // if (loadedPassword) {
  //   c.log('loadedPassword', loadedPassword)
  //   inputPassword.value = loadedPassword
  // }
  if (loadedUserId) {
    tryLogIn()
  }
})

async function tryLogIn() {
  // appState.setPassword(inputPassword.value)
  await appState.loadUser(inputUserId.value)
  if (!appState.currentUser.value) {
    c.l('log in failed')
    return
  }
  c.l('log in success')
  useRouter().push('/')
}

// async function trySignUp() {
//   await appState.createUser(
//     inputUserId.value,
//     inputPassword.value,
//   )
//   if (!appState.currentUser.value) {
//     c.l('sign up failed')
//     return
//   }
//   c.l('sign up success')
//   useRouter().push('/')
// }
</script>

<style lang="scss" scoped>
input {
  text-align: center;
}
</style>
