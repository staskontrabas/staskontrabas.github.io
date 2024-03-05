<template>
    <v-card class="m-overhead m-overhead--white d-block pa-4 overflow-auto">
        <v-row class="d-block">
        <div class="d-flex">
            <v-spacer />
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </div>
    </v-row>

        <v-text-field
            label="Название задачи"
            placeholder=" "
            v-model="name"
        />

        <v-select
            v-model="selectStatus"
            :items="statusList"
            item-text="name"
            item-value="value"
            persistent-hint
            label="Статус"
            placeholder=" "
        />

        <v-autocomplete
            label="Ответственный за проект"
            placeholder=" "
            :items="managers"
            v-model="manager"
            chips
            item-text="name"
            item-value="id"
            >
            <template v-slot:selection="data">
                <v-chip
                    dark
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    close
                    @click:close="removeChips()"
                >
                    <v-avatar
                        left
                    >
                        <v-img :src="data.item.avatar"></v-img>
                    </v-avatar>
                    {{ data.item.name }}
                </v-chip>
            </template>

            <template v-slot:item="data">
                <v-list-item-avatar size="30">
                    <img :src="data.item.avatar">
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                    <v-list-item-subtitle v-html="data.item.role"></v-list-item-subtitle>
                </v-list-item-content>
            </template>
        </v-autocomplete>

        <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
            >
            <template v-slot:activator="{ on }">
                <v-text-field
                    class="mb-4"
                    v-model="computedDateFormatted"
                    label="Дата выполнения"
                    readonly
                    placeholder=" "
                    v-on="on"
                />
            </template>
            <v-date-picker
                ref="picker"
                v-model="date"
                :active-picker.sync="activePicker"
                :landscape="true"
                locale="ru"
                max="2050-01-01"
                min="1950-01-01"
                @change="save"
            ></v-date-picker>
        </v-menu>

        <div class="py-4" style="position: relative;">
            <label for="input-477" class="v-label v-label--active theme--light" style="left: 0px; right: auto; position: absolute; max-width: 133%; -webkit-transform: translateY(-18px) scale(0.75); transform: translateY(-18px) scale(0.75); -webkit-transform-origin: top left; transform-origin: top left;">Картинка ошибки</label>

            <v-btn
                text
                icon
                @click="getImageData"
                class="pic"
                color="#7f7f7f">
                <v-icon size="20">mdi-panorama-variant-outline</v-icon>
            </v-btn>

            <v-img
                v-if="screen"
                :src="screen"
            ></v-img>
            <v-img
                v-else-if="editMode"
                :src="this.task.src"
            ></v-img>
            <v-img
                v-else
                :src="no_image"
                class="no_image"
            ></v-img>
        </div>

        <v-textarea
            label="Описание"
            placeholder=" "
            v-model="description"
            multi-line
            rows="3">
        </v-textarea>

        <v-card-actions class="pa-0">
            <v-spacer></v-spacer>
            <v-btn
                outlined
                color="normal"
                class="m-btn"
                @click="cancel"
            >
            Отмена
            </v-btn>
            <v-btn
                outlined
                color="primary"
                class="m-btn"
                @click="sendTask"
            >
            {{editMode ? 'Отправить' : 'Создать'}}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

export default {
    name: 'TaskCreate',
    props: ['task_form', 'screen', 'project_id', 'blob', 'model', 'editMode', 'task'],
    data () {
        return {
            activePicker: null,
            name: this.editMode ? this.task.name : '',
            selectStatus: this.editMode ? this.task.status : null,
            statusList: [
                {name: 'Новая', value: 0},
                {name: 'В работе', value: 1},
                {name: 'На рассмотрение', value: 2},
                {name: 'Выполненное', value: 3}
            ],
            taskDay: '',
            date: this.editMode ? this.task.deadline.substr(0, 10) : null,
            menu: false,
            manager: this.editMode ? this.task.user : null,
            // screen: require('@/assets/images/screen.png'),
            no_image: 'data:image/png;base64,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AlEsBpht23NCiAXGWKHjOLOWZRVIHx3HyViWJf82h7+BAeIAv4UQ14MiIcQcYyzGOS/MfmJbsaU0P3dYfs3RGgRAAARAAAT+HwEkEEQCCIAACICAKwJIIK6woRMIgAAIgAASCGIABEAABEDAFQEkEFfY0AkEQAAEQAAJBDEAAiAAAiDgigASiCts6AQCIAACIIAEghgAARAAARBwRQAJxBU2dAIBEAABEEACQQyAAAiAAAi4IoAE4gobOoEACIAACCCBIAZAAARAAARcEUACcYUNnUAABEAABJBAEAMgAAIgAAKuCCCBuMKGTiAAAiAAAkggiAEQAAEQAAFXBJBAXGFDJxAAARAAASQQxAAIgAAIgIArAkggrrChEwiAAAiAABIIYgAEQAAEQMAVASQQV9jQCQRAAARAAAkEMQACIAACIOCKABKIK2zoBAIgAAIggASCGAABEAABEHBFAAnEFTZ0AgEQAAEQQAJBDIAACIAACLgigATiChs6gQAIgAAIIIEgBkAABEAABFwRQAJxhQ2dQAAEQAAEkEAQAyAAAiAAAq4IIIG4woZOIAACIAACSCCIARAAARAAAVcEkEBcYUMnEAABEAABJBDEAAiAAAiAgCsCSCCusKETCIAACIDA/wWpWNQqGFIUyQAAAABJRU5ErkJggg==',
            description: this.editMode ? this.task.dscr : ''
        }
    },
    computed: {
        computedDateFormatted(){
            let date = this.formatDate(this.date)
            return date
        },
        managers(){
            let users = this.$store.state.administration.company.users || []
            let list = users.map(u => ({
                id: u.id,
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: ''
            }))
            return list
        }
    },
    watch: {
        menu(val){
            val && setTimeout(() => (this.activePicker = 'YEAR'))
        }
    },
    methods: {
        getImageData(){
            this.$emit('getImageData')
        },
        cancel(){
            this.setTaskNew(false)
            this.$emit('update:task_form', false)
            this.$emit('update:editMode', false)
            this.$emit('update:task', null)
        },
        setTaskNew(v){
            this.$emit('setTaskNew', v)
        },
        save(date){
            this.$refs.menu.save(date)
        },
        formatDate(date){
            if (!date) return null

            const [year, month, day] = date.split('-')
            let delta = new Date().getTimezoneOffset()

            let bd = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), (Math.abs(delta) / 60))
            let mbd = bd.getTime(bd)

            this.taskDay = mbd
            return `${day}/${month}/${year}`
        },
        parseDate(date){
            if (!date) return null

            const [day, month, year] = date.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        },
        removeChips(){
            this.manager = null
        },
        sendTask(){
            let formData = new FormData()

            if(!this.editMode){
                formData.append('file', this.blob)
                formData.append('name', this.model.name)
                formData.append('JSON', JSON.stringify({
                    deadline: (new Date(this.date)).toISOString(),
                    docid: this.model.id,
                    status: this.selectStatus,
                    name: this.name,
                    user: this.manager,
                    dscr: this.description,
                    file: ''
                }))
            }
            else{
                let body = {}
                if(this.screen){
                    formData.append('file', this.blob)
                    formData.append('name', this.model.name)
                }
                if(this.name != this.task.name){
                    body.name = this.name
                }
                if((new Date(this.date)).toISOString() != this.task.deadline){
                    body.deadline = (new Date(this.date)).toISOString()
                }
                if(this.manager != this.task.user){
                    body.user = this.manager
                }
                if(this.selectStatus != this.task.status){
                    body.status = this.selectStatus
                }
                if(this.description != this.task.dscr){
                    body.dscr = this.description
                }
                if(this.name != this.task.name){
                    body.name = this.name
                }
                formData.append('JSON', JSON.stringify(body))
            }
            this.cancel()

            this.$store.dispatch('workflow/updateTask', {
                type_id: 'c',
                id: this.$store.state.administration.company.id,
                project_uuid: this.project_id,
                body: formData,
                task_id: this.editMode ? this.task.task_id.toString() : false,
                docid: this.model.id,
                filter: {
                    docid: this.model.id
                }
            })
        }
    }
}
</script>

<style>
.pic{
    position: absolute;
    top: -13px;
    right: 0;
}
.no_image{
    opacity: 0.3;
}
</style>
