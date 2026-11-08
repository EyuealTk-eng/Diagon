export const roles= Object.freeze({
    buyer:'buyer',
    merchant:'merchant',
    moderator:'moderator',
    admin:'admin',
})

export const listingKinds= Object.freeze({
  item:'item',
  service:'service',
  food:'food',
})

export const listingStatus=Object.freeze({
  draft: 'draft',
  active: 'active',
  reserved: 'reserved',
  sold: 'sold',
  expired: 'expired',
  removed: 'removed',
})

export const itemCondition=Object.freeze({
    new:'new',
    likeNew:'like new',
    good:'good',
    fair:'fair',
    forParts:'for parts',
})

export const inquiryChannels= Object.freeze({
    telegram:'telegram',
    phone:'phone',
    inApp:'in App',

})