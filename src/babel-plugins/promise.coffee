
# - Promise.resolve(result)             => Promise(result)
# - Promise.resolve().then(onFulfilled) => Promise.try(onFulfilled)
# - new Promise(resolver)               => Promise.resolve(resolver)
# - Promise.denodeify(func)             => Promise.ify(func)
# - promise.catch(onRejected)           => promise.fail(onRejected)
