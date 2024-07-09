<template>
  <PageTemplate>
    <h1 class="textcenter marbotbig bold">DDDaily</h1>
    <div
      v-if="!loading"
      class="flexcolumn flexcenter gap login"
    >
      <!-- I am
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
      <button @click="tryLogIn">Go</button> -->

      <form class="flexcolumn flexcenter gap textcenter">
        <div class="marbotbig">
          <h3>I am</h3>
          <input
            class="big"
            v-model="inputUserId"
            placeholder="Enter a username..."
            autofocus
            autocapitalize="false"
            autocomplete="false"
            autocorrect="false"
            spellcheck="false"
          />
        </div>

        <div class="marbotbig">
          <h3>and my password is</h3>
          <input
            class="big"
            v-model="inputPassword"
            type="password"
            autocapitalize="false"
            autocomplete="false"
            autocorrect="false"
            spellcheck="false"
          />
        </div>

        <div class="flexstretch gap">
          <input
            type="submit"
            class="button"
            @click="tryLogIn"
            value="Go"
          />
        </div>
      </form>

      <div class="warning" v-if="message">
        {{ message }}
      </div>
    </div>
    <div v-else>
      <div class="marbig padbig text2">Loading...</div>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

let inputUserId = ref('')
let inputPassword = ref('')
let message = ref('')
let loading = ref(false)

onMounted(() => {
  const loadedUserId = appState.getUserId()
  if (loadedUserId) {
    c.log('loadedUserId', loadedUserId)
    inputUserId.value = loadedUserId
  }
  const loadedPassword = appState.getPassword()
  if (loadedPassword) {
    // c.log('loadedPassword', loadedPassword)
    inputPassword.value = loadedPassword
  }
  // if (loadedUserId && loadedPassword) {
  //   tryLogIn()
  // }
})

async function tryLogIn() {
  loading.value = true
  message.value = ''
  appState.setPassword(inputPassword.value)
  const loadUserRes = await appState.loadUser(
    inputUserId.value,
  )
  if (loadUserRes && 'error' in loadUserRes) {
    message.value = `${loadUserRes.error}`
  }
  if (!appState.currentUser.value) {
    c.l('log in failed')
    loading.value = false
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
  max-width: 100%;
  text-align: center;
}
</style>
