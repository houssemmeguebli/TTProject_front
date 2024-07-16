
export class TTRequest {
    constructor(requestId, status, startDate, endDate, comment, userId) {
        this.requestId = requestId;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.comment = comment;
        this.userId = userId;
    }
}
