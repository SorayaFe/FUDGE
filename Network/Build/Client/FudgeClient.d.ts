/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeNet {
    enum COMMAND {
        UNDEFINED = "undefined",
        ERROR = "error",
        /** sent from server to assign an id for the connection and reconfirmed by the client. `idTarget` is used to carry the id  */
        ASSIGN_ID = "assignId",
        /** sent from a client to the server to suggest a login name. `name` used for the suggested name  */
        LOGIN_REQUEST = "loginRequest",
        /** sent from the server to the client requesting a login name. `content.success` is true or false for feedback */
        LOGIN_RESPONSE = "loginResponse",
        /** sent from the server every second to check if the connection is still up.
         * `content` is an array of objects with the ids of the clients and their connected peers as known to the server */
        SERVER_HEARTBEAT = "serverHeartbeat",
        /** not used yet */
        CLIENT_HEARTBEAT = "clientHeartbeat",
        /** command used internally when a client tries to connect to another via rtc to create a peer-to-peer-connection */
        RTC_OFFER = "rtcOffer",
        /** command used internally when a client answers a conection request from another client */
        RTC_ANSWER = "rtcAnswer",
        /** command used internally when a client send its connection candidates for peer-to-peer connetion */
        ICE_CANDIDATE = "rtcCandidate",
        /** TODO: use to dissolve peer-to-peer-connections between clients to cleanup structures previously built */
        DISCONNECT_CLIENT = "disconnect_client",
        /** command sent by a client to the server and from the server to all clients to initiate a mesh structure between the clients
         * creating peer-to-peer-connections between all clients known to the server */
        CREATE_MESH = "createMesh",
        /** command sent by a client, which is supposed to become the host, to the server and from the server to all clients
         * to create peer-to-peer-connections between this host and all other clients known to the server */
        CONNECT_HOST = "connectHost",
        /** command initializing peer-to-peer-connections between the client identified with `idTarget` and all the peers
         * identified by the array giwen with `content.peers` */
        CONNECT_PEERS = "connectPeers"
    }
    /**
     * Defines the route the message should take.
     * - route undefined -> send message to peer idTarget using RTC
     * - route undefined & idTarget undefined -> send message to all peers using RTC
     * - route HOST -> send message to peer acting as host using RTC, ignoring idTarget
     * - route SERVER -> send message to server using websocket
     * - route VIA_SERVER -> send message to client idTarget via server using websocket
     * - route VIA_SERVER_HOST -> send message to client acting as host via server using websocket, ignoring idTarget
     */
    enum ROUTE {
        HOST = "toHost",
        SERVER = "toServer",
        VIA_SERVER = "viaServer",
        VIA_SERVER_HOST = "viaServerToHost"
    }
    interface Message {
        /** the command the message is supposed to trigger */
        command?: COMMAND;
        /** the route the message is supposed to take, undefined for peers */
        route?: ROUTE;
        /** the id of the client sending the message, undefined for server. Automatically inserted by dispatch-method */
        idSource?: string;
        /** the id of the intended recipient of the message, undefined for messages to the server or to all */
        idTarget?: string;
        /** the timestamp of the server sending or passing this message. Automatically set by dispatch- or pass-method */
        timeServer?: number;
        /** the timestamp of the sender. Automatically set by dispatch-method */
        timeSender?: number;
        /** the actual content of the message as a simple javascript object like a FUDGE-Mutator */
        content?: {
            [key: string]: any;
        };
    }
}
declare namespace FudgeNet {
    enum EVENT {
        CONNECTION_OPENED = "open",
        CONNECTION_CLOSED = "close",
        ERROR = "error",
        MESSAGE_RECEIVED = "message"
    }
    let configuration: {
        iceServers: {
            urls: string;
        }[];
    };
    /**
     * Manages a single rtc peer-to-peer connection with multiple channels.
     * {@link FudgeNet.Message}s are passed on from the client using this connection
     * for further processing by some observer. Instances of this class are
     * used internally by the {@link FudgeClient} and should not be used otherwise.
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class RtcConnection {
        peerConnection: RTCPeerConnection;
        dataChannel: RTCDataChannel | undefined;
        mediaStream: MediaStream | undefined;
        constructor();
        createDataChannel(_client: FudgeClient, _idRemote: string): void;
        addDataChannel(_client: FudgeClient, _dataChannel: RTCDataChannel): void;
    }
}
declare namespace FudgeNet {
    /**
     * Manages a websocket connection to a FudgeServer and multiple rtc-connections to other FudgeClients.
     * Processes messages from in the format {@link FudgeNet.Message} according to the controlling
     * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.
     * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class FudgeClient extends EventTarget {
        id: string;
        name: string;
        urlServer: string | undefined;
        socket: WebSocket;
        peers: {
            [id: string]: RtcConnection;
        };
        constructor();
        /**
         * Tries to connect to the server at the given url and installs the appropriate listeners
         */
        connectToServer: (_uri?: string) => void;
        /**
         * Tries to publish a human readable name for this client. Identification still solely by `id`
         */
        loginToServer: (_name: string) => void;
        /**
         * Tries to connect to another client with the given `id` via rtc
         */
        connectToPeer: (_idRemote: string) => void;
        /**
         * Dispatches a {@link FudgeNet.Message} to the server, a specific client or all
         * accourding to {@link FudgeNet.ROUTE} and `idTarget`
         */
        dispatch(_message: FudgeNet.Message): void;
        private sendToPeer;
        private sendToAllPeers;
        private addWebSocketEventListeners;
        private hndMessage;
        private beginPeerConnectionNegotiation;
        private createNegotiationOfferAndSendToPeer;
        private receiveNegotiationOfferAndSetRemoteDescription;
        private answerNegotiationOffer;
        private receiveAnswerAndSetRemoteDescription;
        private sendIceCandidatesToPeer;
        private addReceivedCandidateToPeerConnection;
        private receiveDataChannelAndEstablishConnection;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
    }
}
