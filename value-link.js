const ValueLink = (root, validation, onChange) => {
    let data = {
        root: root || {}
    }

    let errors = { errorPath: [], errorMessage: '' }

    const slice = Array.prototype.slice
    const toString = Object.prototype.toString
    const replace = String.prototype.replace

    const resolve = path => {
        let cursor = data
        let i
        let iu = path.length - 1
        for (i = 0; i < iu; i++) {
            if (cursor.hasOwnProperty(path[i])) {
                cursor = cursor[path[i]]
            } else {
                break
            }
        }

        if (cursor.hasOwnProperty(path[i])) {
            return cursor[path[iu]]
        } else {
            return null
        }
    }

    const route = path => {
        let tempPath = []
        for (let i = 0; i < path.length; i++) {
            tempPath[i] = replace.call(path[i], '/', '~1')
        }
        return '/' + tempPath.slice(1).join('/')
    }

    const _requestChange = (link, path, value) => {
        if (toString.call(link.handleChange) === '[object Function]') {
            return link.handleChange(value, function (value) {
                _requestChange(link, path, value)
            })
        }
        console.log("called Request Chnage")
        let cursor = data
        let i
        let iu = path.length - 1
        for (i = 0; i < iu; i++) {
            if (!cursor.hasOwnProperty(path[i])) {
                // is the next path element an integer?
                if (Math.floor(path[i + 1]) === path[i + 1]) {
                    cursor[path[i]] = []
                } else {
                    cursor[path[i]] = {}
                }
            }

            cursor = cursor[path[i]]
        }
        cursor[path[i]] = value
        onChange(data.root)
    }

    const _requestChangeWithValidation = (link, path, value) => {
        if (toString.call(link.handleChange) === '[object Function]') {
            return link.handleChange(value, function (value) {
                _requestChange(link, path, value)
            })
        }

        let cursor = data
        let i
        let iu = path.length - 1
        for (i = 0; i < iu; i++) {
            if (!cursor.hasOwnProperty(path[i])) {
                // is the next path element an integer?
                if (Math.floor(path[i + 1]) === path[i + 1]) {
                    cursor[path[i]] = []
                } else {
                    cursor[path[i]] = {}
                }
            }

            cursor = cursor[path[i]]
        }
        cursor[path[i]] = value
        errors = validation(data.root)
        console.log('Validated!', errors.errorPath)
        onChange(data.root)
    }

    const validate = () => {
        errors = validation(data.root)
        console.log('Validated!', errors.errorPath)
        onChange(data.root)
    }

    const _error = (link, path) => {

        console.log('errors', errors.errorPath)
        console.log('path', link.path)
        let errorMessage = errors.errorMessage
        let errorPath = errors.errorPath
        let isError = false
        let errorContent = {
            errorMessage,
            isError
        }
        if (!errorPath.length) {
            errorContent.isError = false
            return errorContent
            // return false
        }

        for (let i = 0; i < errorPath.length; i++) {
            if (errorPath[i] === link.path) {
                errorContent.errorMessage = errorMessage[i]
                errorContent.isError = true
                return errorContent
                // return true
            }
        }

        return errorContent
    }

    const _onChange = (link, element) => {
        link.requestChange(element.type === 'checkbox' ? element.checked : element.value)
    }

    const getLink = path => {
        function link () {
            return getLink(path.concat(slice.call(arguments)))
        }

        link.value = resolve(path)
        link.onChange = event => _onChange(link, event.target)
        link.requestChange = value => _requestChange(link, path, value)
        link.requestChangeWithValidation = value => _requestChangeWithValidation(link, path, value)
        link.validate = validate
        link.path = route(path)
        link.handleError = () => _error(link, path)
        return link
    }

    return getLink(['root'])
}

export default ValueLink
