declare const IMAGE_PURPOSE: {
    readonly Thumbnail: "Thumbnail";
    readonly Banner: "Banner";
    readonly Avatar: "Avatar";
    readonly Gallery: "Gallery";
    readonly General: "General";
};
type ImagePurpose = keyof typeof IMAGE_PURPOSE;
type ImageDimension = {
    width: number;
    height: number;
};

export { IMAGE_PURPOSE, type ImageDimension, type ImagePurpose };
