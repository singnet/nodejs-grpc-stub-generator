import ZipLocal from 'zip-local'
import extract from 'extract-zip'


export const extractFile = async(source, target) => {
    await extract(source, { dir: target }, function (err) {
        if (err) {
            throw err
        }
    })
}

export const ZipFile = async (source, target) => {
    ZipLocal.sync.zip(source).compress().save(target);
}
