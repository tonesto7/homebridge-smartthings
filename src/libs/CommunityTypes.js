const inherits = require('util').inherits;

module.exports = function(Service, Characteristic) {
    var CommunityTypes = {};
    CommunityTypes.KilowattHours = function() {
        Characteristic.call(this, 'Total Consumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT32,
            unit: 'kWh',
            minValue: 0,
            maxValue: 65535,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.KilowattHours, Characteristic);

    CommunityTypes.Watts = function() {
        Characteristic.call(this, 'Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT16,
            unit: 'W',
            minValue: 0,
            maxValue: 65535,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.Watts, Characteristic);


    // Characteristics
    CommunityTypes.Timestamp = function() {
        Characteristic.call(this, "Timestamp", 'FF000001-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.Timestamp, Characteristic);

    CommunityTypes.AudioDataURL = function() {
        Characteristic.call(this, "Audio URL", 'FF000002-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
    };
    inherits(CommunityTypes.AudioDataURL, Characteristic);

    CommunityTypes.VideoDataURL = function() {
        Characteristic.call(this, "Video URL", 'FF000003-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
    };
    inherits(CommunityTypes.VideoDataURL, Characteristic);

    CommunityTypes.AudioVolume = function() {
        Characteristic.call(this, 'Audio Volume', '00001001-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT8,
            unit: Characteristic.Units.PERCENTAGE,
            maxValue: 100,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.AudioVolume, Characteristic);

    CommunityTypes.Muting = function() {
        Characteristic.call(this, 'Muting', '00001002-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT8,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.Muting, Characteristic);

    CommunityTypes.PlaybackState = function() {
        Characteristic.call(this, 'Playback State', '00002001-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT8,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.PlaybackState, Characteristic);
    CommunityTypes.PlaybackState.PLAYING = 0;
    CommunityTypes.PlaybackState.PAUSED = 1;
    CommunityTypes.PlaybackState.STOPPED = 2;

    CommunityTypes.SkipForward = function() {
        Characteristic.call(this, 'Skip Forward', '00002002-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.BOOL,
            perms: [Characteristic.Perms.WRITE]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.SkipForward, Characteristic);

    CommunityTypes.SkipBackward = function() {
        Characteristic.call(this, 'Skip Backward', '00002003-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.BOOL,
            perms: [Characteristic.Perms.WRITE]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.SkipBackward, Characteristic);

    CommunityTypes.ShuffleMode = function() {
        Characteristic.call(this, 'Shuffle Mode', '00002004-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT8,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.ShuffleMode, Characteristic);
    //NOTE: If GROUP or SET is not supported, accessories should coerce to ALBUM.
    // If ALBUM is not supported, coerce to ITEM.
    // In general, it is recommended for apps to only assume OFF, ITEM, and ALBUM
    // are supported unless it is known that the accessory supports other settings.
    CommunityTypes.ShuffleMode.OFF = 0;
    //NOTE: INDIVIDUAL is deprecated.
    CommunityTypes.ShuffleMode.ITEM = CommunityTypes.ShuffleMode.INDIVIDUAL = 1;
    CommunityTypes.ShuffleMode.GROUP = 2; // e.g. iTunes "Groupings"
    CommunityTypes.ShuffleMode.ALBUM = 3; // e.g. album or season
    CommunityTypes.ShuffleMode.SET = 4; // e.g. T.V. Series or album box set

    CommunityTypes.RepeatMode = function() {
        Characteristic.call(this, 'Repeat Mode', '00002005-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT8,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.RepeatMode, Characteristic);
    CommunityTypes.RepeatMode.OFF = 0;
    CommunityTypes.RepeatMode.ONE = 1;
    CommunityTypes.RepeatMode.ALL = 2;

    CommunityTypes.PlaybackSpeed = function() {
        Characteristic.call(this, 'Playback Speed', '00002006-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.PlaybackSpeed, Characteristic);

    CommunityTypes.MediaCurrentPosition = function() {
        Characteristic.call(this, 'Media Current Position', '00002007-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.FLOAT, // In seconds
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaCurrentPosition, Characteristic);

    CommunityTypes.MediaItemName = function() {
        Characteristic.call(this, 'Media Name', '00003001-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaItemName, Characteristic);

    CommunityTypes.MediaItemAlbumName = function() {
        Characteristic.call(this, 'Media Album Name', '00003002-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaItemAlbumName, Characteristic);

    CommunityTypes.MediaItemArtist = function() {
        Characteristic.call(this, 'Media Artist', '00003003-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaItemArtist, Characteristic);

    CommunityTypes.MediaItemDuration = function() {
        Characteristic.call(this, 'Media Duration', '00003005-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.FLOAT, // In seconds
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaItemDuration, Characteristic);

    CommunityTypes.StillImage = function() {
        Characteristic.call(this, 'Still Image', '00004001-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.DATA,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.StillImage, Characteristic);

    // Also known as MIME type...
    CommunityTypes.MediaTypeIdentifier = function() {
        Characteristic.call(this, 'Media Type Identifier', '00004002-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = null;
    };
    inherits(CommunityTypes.MediaTypeIdentifier, Characteristic);

    CommunityTypes.MediaWidth = function() {
        Characteristic.call(this, 'Media Width', '00004003-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT32,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaWidth, Characteristic);

    CommunityTypes.MediaHeight = function() {
        Characteristic.call(this, 'Media Width', '00004004-0000-1000-8000-135D67EC4377');
        this.setProps({
            format: Characteristic.Formats.UINT32,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.MediaHeight, Characteristic);

    // Custom SmartThings Device Characteristic
    CommunityTypes.DeviceId = function() {
        Characteristic.call(this, 'Device Id', '2ecc2a94-30d3-4457-bba7-0a93468de8a4');
        this.setProps({
            format: Characteristic.Formats.STRING,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.HIDDEN]
        });

        this.value = this.getDefaultValue();
    };
    inherits(CommunityTypes.DeviceId, Characteristic);

    // Services

    CommunityTypes.AudioDeviceService = function(displayName, subtype) {
        Service.call(this, displayName, '00000001-0000-1000-8000-135D67EC4377', subtype);

        // Required Characteristics
        this.addCharacteristic(CommunityTypes.AudioVolume);

        // Optional Characteristics
        this.addOptionalCharacteristic(CommunityTypes.Muting);
        this.addOptionalCharacteristic(Characteristic.Name);
    };
    inherits(CommunityTypes.AudioDeviceService, Service);

    CommunityTypes.PlaybackDeviceService = function(displayName, subtype) {
        Service.call(this, displayName, '00000002-0000-1000-8000-135D67EC4377', subtype);

        // Required Characteristics
        this.addCharacteristic(CommunityTypes.PlaybackState);

        // Optional Characteristics
        this.addOptionalCharacteristic(CommunityTypes.SkipForward);
        this.addOptionalCharacteristic(CommunityTypes.SkipBackward);
        this.addOptionalCharacteristic(CommunityTypes.ShuffleMode);
        this.addOptionalCharacteristic(CommunityTypes.RepeatMode);
        this.addOptionalCharacteristic(CommunityTypes.PlaybackSpeed);
        this.addOptionalCharacteristic(CommunityTypes.MediaCurrentPosition);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemName);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemAlbumName);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemArtist);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemDuration);
        this.addOptionalCharacteristic(Characteristic.Name);
        // Artwork characteristics...would be better reported in a separate service?
        this.addOptionalCharacteristic(CommunityTypes.StillImage);
        this.addOptionalCharacteristic(CommunityTypes.MediaTypeIdentifier);
        this.addOptionalCharacteristic(CommunityTypes.MediaWidth);
        this.addOptionalCharacteristic(CommunityTypes.MediaHeight);
    };
    inherits(CommunityTypes.PlaybackDeviceService, Service);

    // A media information service that has no playback controls, for e.g. DAB radio...
    CommunityTypes.MediaInformationService = function(displayName, subtype) {
        Service.call(this, displayName, '00000003-0000-1000-8000-135D67EC4377', subtype);

        // Required Characteristics
        this.addCharacteristic(CommunityTypes.MediaItemName);

        // Optional Characteristics
        this.addOptionalCharacteristic(CommunityTypes.MediaItemAlbumName);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemArtist);
        this.addOptionalCharacteristic(CommunityTypes.MediaItemDuration);
        this.addOptionalCharacteristic(CommunityTypes.MediaCurrentPosition);
        this.addOptionalCharacteristic(Characteristic.Name);
        // Artwork characteristics...would be better reported in a separate service?
        this.addOptionalCharacteristic(CommunityTypes.StillImage);
        this.addOptionalCharacteristic(CommunityTypes.MediaTypeIdentifier);
        this.addOptionalCharacteristic(CommunityTypes.MediaWidth);
        this.addOptionalCharacteristic(CommunityTypes.MediaHeight);
    };
    inherits(CommunityTypes.MediaInformationService, Service);

    CommunityTypes.StillImageService = function(displayName, subtype) {
        Service.call(this, displayName, '00000004-0000-1000-8000-135D67EC4377', subtype);

        // Required Characteristics
        this.addCharacteristic(CommunityTypes.StillImage);
        this.addCharacteristic(CommunityTypes.MediaTypeIdentifier);

        // Optional Characteristics
        this.addOptionalCharacteristic(CommunityTypes.MediaWidth);
        this.addOptionalCharacteristic(CommunityTypes.MediaHeight);
        this.addOptionalCharacteristic(Characteristic.Name);
    };
    inherits(CommunityTypes.StillImageService, Service);

    CommunityTypes.SecurityCameraService = function(displayName, subtype) {
        Service.call(this, displayName, '00000005-0000-1000-8000-135D67EC4377', subtype);

        // Required Characteristics
        this.addCharacteristic(CommunityTypes.StillImageService);
        this.addCharacteristic(CommunityTypes.MediaTypeIdentifier);

        // Optional Characteristics
        this.addOptionalCharacteristic(CommunityTypes.Timestamp);
        this.addOptionalCharacteristic(CommunityTypes.MediaWidth);
        this.addOptionalCharacteristic(CommunityTypes.MediaHeight);
        this.addOptionalCharacteristic(CommunityTypes.VideoDataURL);
        this.addOptionalCharacteristic(CommunityTypes.AudioDataURL);
        this.addOptionalCharacteristic(Characteristic.MotionDetected);
        this.addOptionalCharacteristic(Characteristic.StatusTampered);
        this.addOptionalCharacteristic(Characteristic.Name);
    };
    
    CommunityTypes.FanOscilationMode = function() {
         Characteristic.call(this, 'RotationSpeed', '00000029-0000-1000-8000-0026BB765291');
         this.setProps({
             format: Characteristic.Formats.UINT8,
             maxValue: 100,
             minValue: 0,
             validValues: [25,50,75,100],
             perms: [Characteristic.Perms.READ,Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
         });
         this.value = this.getDefaultValue();
     };
     inherits(CommunityTypes.FanOscilationMode, Characteristic.RotationSpeed);

     // The value property of FanOscilationMode must be one of the following:
     CommunityTypes.FanOscilationMode.SLEEP  = 25;
     CommunityTypes.FanOscilationMode.LOW    = 50;
     CommunityTypes.FanOscilationMode.MEDIUM = 75;
     CommunityTypes.FanOscilationMode.HIGH   = 100;
     
     CommunityTypes.NewAirPurifierService = function(displayName, subtype) {
         Service.call(this, displayName, '000000BB-0000-1000-8000-0026BB765291', subtype);

         // Required Characteristics
         this.addCharacteristic(Characteristic.Active);
         this.addCharacteristic(Characteristic.CurrentAirPurifierState);
         this.addCharacteristic(Characteristic.TargetAirPurifierState);
         this.addCharacteristic(CommunityTypes.FanOscilationMode);

         // Optional Characteristics
         this.addOptionalCharacteristic(Characteristic.Name);
     };
     inherits(CommunityTypes.NewAirPurifierService, Service.AirPurifier);

    return CommunityTypes;
};