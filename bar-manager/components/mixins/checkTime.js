export const checkTime = {
    methods: {
        getTime: function(d){
            const tzoffset = (new Date()).getTimezoneOffset() * 60000
            const date = new Date((new Date(d)).getTime() + tzoffset)
            const time = date.getFullYear() + '-'
              + this.pad2(date.getMonth() + 1) + '-'
              + this.pad2(date.getDate()) + ' '
              + this.pad2(date.getHours()) + ':'
              + this.pad2(date.getMinutes()) + ':'
              + this.pad2(date.getSeconds())
            return time
        },
        pad2: function(n){
            return n < 10 ? '0' + n : n
        }
    }
}
export const setTime = {
    methods: {
        setTime: function(item){
            let data = {
                period_id: item.id
            }
            const date = new Date()
            const tzoffset = (new Date()).getTimezoneOffset() * 60000

            let getMonday = function(d) {
                d = new Date(d);
                let day = d.getDay();
                let diff = d.getDate() - day + (day == 0 ? -6 : 1);
                return new Date(d.setDate(diff));
              }

            if(item.id == 0){
                // Today
                let now = new Date(date)
                date.setHours(12, 0, 0, 0) // start workday from 12:00
                if (now < date) {
                    date.setDate(date.getDate() - 1)
                }

                let time = date - tzoffset

                data['start_time'] = (new Date(time)).toISOString()
                data['end_time'] = false
            }
            else if(item.id == 1){
                // Yesterday
                let now = new Date(date)

                let today = date
                today.setHours(12, 0, 0, 0) // start workday from 12:00
                if (now < date) {
                    today.setDate(today.getDate() - 1)
                }

                let yesterday = new Date(new Date().setDate(today.getDate() - 1))
                yesterday.setHours(12, 0, 0, 0) // start previous workday from 12:00

                data['start_time'] = (new Date(yesterday - tzoffset)).toISOString()
                data['end_time'] = (new Date(today - tzoffset)).toISOString()
            }
            else if(item.id == 2){
                // Week
                let monday = getMonday(date)
                monday.setHours(12, 0, 0, 0) // start from 08:00 when the week range is selected

                data['start_time'] = (new Date(monday - tzoffset)).toISOString()
                data['end_time'] = false
            }
            else if(item.id == 3){
                // Month
                let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                firstDay.setHours(12, 0, 0, 0) // start from 00:00 when the week range is selected
                let time = firstDay - tzoffset

                data['start_time'] = (new Date(time)).toISOString()
                data['end_time'] = false
            }
            else if(item.id == 4){
                // All the time
                data['start_time'] = false
                data['end_time'] = false
            }
            else if(item.id == 5){
                if(item.start_time == '')
                    return
                data['start_time'] = item.start_time != '' ? (new Date(new Date(item.start_time) - tzoffset)).toISOString() : false
                data['end_time'] = item.end_time != '' ? (new Date(new Date(item.end_time) - tzoffset)).toISOString() : (new Date((new Date()).getTime() - tzoffset)).toISOString()
            }

            return data
        }
    }
}
