<template>
  <PageTemplate class="flexcolumn flexcenter gap">
    userId:<input v-model="inputUserId" />
    <br />
    password: <input v-model="inputPassword" />
    <br />
    <button @click="tryLogIn">log in</button>
    <button @click="trySignUp">sign up</button>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

let inputUserId = ref('')
let inputPassword = ref('')

onMounted(() => {
  const loadedUserId = appState.getUserId()
  if (loadedUserId) {
    c.log('loadedUserId', loadedUserId)
    inputUserId.value = loadedUserId
  }
  const loadedPassword = appState.getPassword()
  if (loadedPassword) {
    c.log('loadedPassword', loadedPassword)
    inputPassword.value = loadedPassword
  }
  if (loadedUserId && loadedPassword) {
    tryLogIn()
  }
})

async function tryLogIn() {
  appState.setPassword(inputPassword.value)
  await appState.loadUser(inputUserId.value)
  if (!appState.currentUser.value) {
    c.l('log in failed')
    return
  }
  c.l('log in success')
  useRouter().push('/')
}

async function trySignUp() {
  await appState.createUser(
    inputUserId.value,
    inputPassword.value,
  )
  if (!appState.currentUser.value) {
    c.l('sign up failed')
    return
  }
  c.l('sign up success')
  useRouter().push('/')
}
</script>

<style lang="scss" scoped></style>
