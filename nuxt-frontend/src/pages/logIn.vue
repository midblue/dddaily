<template>
  <PageTemplate>
    <div
      v-if="show"
      class="flexcolumn flexcenter gap login"
    >
      I am
      <input
        v-model="inputUserId"
        autofocus
        placeholder="Enter a username..."
        autocomplete="false"
        autocorrect="false"
        autocapitalize="false"
        spellcheck="false"
        @keydown.enter="tryLogIn"
      />
      <br />
      <!-- password: <input v-model="inputPassword" />
    <br /> -->
      <button @click="tryLogIn">Go</button>
      <!-- <button @click="trySignUp">sign up</button> -->
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'

let inputUserId = ref('')
// let inputPassword = ref('')

let show = ref(false)

onMounted(() => {
  const loadedUserId = appState.getUserId()
  if (loadedUserId) {
    c.log('loaded UserId on login page', loadedUserId)
    inputUserId.value = loadedUserId
    tryLogIn()
  } else {
    c.log('no loaded UserId on login page')
    show.value = true
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
.login {
  & > * {
    flex-grow: 0;
  }
}
input {
  text-align: center;
}
</style>
