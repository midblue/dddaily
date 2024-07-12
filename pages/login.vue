<template>
  <PageTemplate>
    <h1 class="marbot bold highlight">DDDaily</h1>
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

      <form class="flexcolumn flexverticalcenter gap">
        <div class="marbotbig padbot">
          <h3 class="marnone">I am</h3>
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
          <h3 class="marnone">and my password is</h3>
          <div>
            <input
              class="big"
              v-model="inputPassword"
              placeholder="Your password here..."
              type="password"
              autocapitalize="false"
              autocomplete="false"
              autocorrect="false"
              spellcheck="false"
            />
          </div>
          <div class="sub fade martop">
            (Make one up if you don't have one yet!)
          </div>
        </div>

        <input
          type="submit"
          class="button big fullwidth"
          @click="tryLogIn"
          value="Go"
        />
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
h1 {
  font-size: 4rem;
}
.login {
  & > * {
    flex-grow: 0;
  }
}
input {
  max-width: 100%;
  // text-align: center;
}
</style>
