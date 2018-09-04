module.exports = {
    getTime: function(connectorDay, connectorTime){
        const now = new Date();
        let time = now.getFullYear() + connectorDay;
        time += (now.getMonth() < 9? '0'+ (now.getMonth()+ 1).toString(): (now.getMonth()+1).toString())+ connectorDay;
        time += (now.getDate() < 10? '0'+ (now.getDate()+ 1).toString(): (now.getDate()+1).toString())+ ' ';

        time += (now.getHours() < 10? '0'+ (now.getHours()+ 1).toString(): (now.getHours()+1).toString()) + connectorTime;
        time += (now.getMinutes() < 10? '0'+ (now.getMinutes()+ 1).toString(): (now.getMinutes()+1).toString()) + connectorTime;
        time += (now.getSeconds() < 10? '0'+ (now.getSeconds()+ 1).toString(): (now.getSeconds()+1).toString());
        return time;
    }
};