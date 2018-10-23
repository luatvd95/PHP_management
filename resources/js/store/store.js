import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import workspace from './modules/workspace/index';
import team from './modules/teams/index';
import type from './modules/types/index';

Vue.use(Vuex);
axios.defaults.baseURL = '/api';

export const store = new Vuex.Store({
    modules: {
        workspace: workspace,
        team: team,
        type: type
    },

    state: {
        token: localStorage.getItem('access_token') || null,
        user: {},
        baseUrlLogo: '/assets/app/media/img//logos/',
        urlImage: '/assets/app/media/img/',
        headers: {
            'content-type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization:
                'Bearer ' + localStorage.getItem('access_token') || null
        }
    },

    mutations: {
        login(state, token) {
            state.token = token;
        },

        destroyToken(state) {
            state.token = null;
            state.user = null;
        },

        getUser(state, user) {
            state.user = user;
        }
    },

    getters: {
        loggedIn(state) {
            return state.token !== null;
        }
    },

    actions: {
        login(context, credentials) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/auth/login', {
                        email: credentials.email,
                        password: credentials.password,
                        remember_me: credentials.remember_me
                    })
                    .then(response => {
                        const token = response.data.access_token
                            ? response.data.access_token
                            : null;
                        localStorage.setItem('access_token', token);
                        context.commit('login', token);
                        resolve(response);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    });
            });
        },

        destroyToken(context) {
            axios.defaults.headers.common['Authorization'] =
                'Bearer ' + context.state.token;

            if (context.getters.loggedIn) {
                return new Promise((resolve, reject) => {
                    axios
                        .get('/logout')
                        .then(response => {
                            localStorage.removeItem('access_token');
                            context.commit('destroyToken');
                            resolve(response);
                        })
                        .catch(error => {
                            localStorage.removeItem('access_token');
                            context.commit('destroyToken');
                            reject(error);
                        });
                });
            }
        },

        getUser(context) {
            axios.defaults.headers.common['Authorization'] =
                'Bearer ' + localStorage.getItem('access_token');

            axios.get('/current-user').then(response => {
                context.commit('getUser', response);
            });
        },

        signup(context, data) {
            axios.defaults.headers.common['Authorization'] =
                'Bearer ' + context.state.token;

            if (context.getters.loggedIn) {
                return new Promise((resolve, reject) => {
                    axios
                        .post('/signup', {
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            password_confirmation: data.password_confirm,
                            school: data.school,
                            batch_id: data.batch_id,
                            role_id: data.role_id
                        })
                        .then(response => {
                            resolve(response);
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
            }
        }
    }
});
